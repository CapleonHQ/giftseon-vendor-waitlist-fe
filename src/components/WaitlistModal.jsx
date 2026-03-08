import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { BUSINESS_CATEGORIES, NIGERIAN_STATES } from '../data/constants'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/* ─── Step indicator ─── */
function StepDot({ step, current }) {
  const done = current > step
  const active = current === step
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
          done
            ? 'bg-brand text-white'
            : active
            ? 'bg-brand text-white ring-4 ring-brand/20'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        {done ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : step}
      </div>
    </div>
  )
}

/* ─── Input field helper ─── */
function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-brand ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default function WaitlistModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1) // 1=personal, 2=business, 3=verify email, 4=success
  const [loading, setLoading] = useState(false)
  const [sendingOTP, setSendingOTP] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [emailVerified, setEmailVerified] = useState(false)
  const timerRef = useRef(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
    businessCategory: '',
    customCategory: '',
    state: '',
    referralCode: '',
    consent: false,
    otp: '',
  })
  const [errors, setErrors] = useState({})

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setOtpSent(false)
      setEmailVerified(false)
      setOtpTimer(0)
      setErrors({})
      setForm({
        firstName: '', lastName: '', email: '', whatsapp: '',
        businessCategory: '', customCategory: '', state: '',
        referralCode: '', consent: false, otp: '',
      })
    }
    return () => clearInterval(timerRef.current)
  }, [isOpen])

  // OTP countdown
  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setInterval(() => {
        setOtpTimer(t => {
          if (t <= 1) { clearInterval(timerRef.current); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [otpTimer])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  /* ─── Validation ─── */
  const validateStep1 = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required'
    if (!form.email.trim()) errs.email = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (!emailVerified) errs.email = errs.email || 'Please verify your email before proceeding'
    if (!form.whatsapp.trim()) errs.whatsapp = 'WhatsApp number is required'
    else if (!/^\+?[\d\s\-()]{7,20}$/.test(form.whatsapp)) errs.whatsapp = 'Enter a valid phone number'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs = {}
    if (!form.businessCategory) errs.businessCategory = 'Business category is required'
    if (form.businessCategory === 'Other (please specify)' && !form.customCategory.trim())
      errs.customCategory = 'Please specify your business category'
    if (!form.state) errs.state = 'State is required'
    if (!form.consent) errs.consent = 'You must consent to proceed'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ─── Send OTP → Express server → Resend ─── */
  const handleSendOTP = async () => {
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors(e => ({ ...e, email: 'Enter a valid email to verify' }))
      return
    }
    setSendingOTP(true)
    setErrors(e => ({ ...e, email: '' }))
    try {
      const res = await fetch(`${API}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors(e => ({ ...e, email: data.error || 'Failed to send code. Please try again.' }))
        return
      }
      setOtpSent(true)
      setOtpTimer(120)
    } catch {
      setErrors(e => ({ ...e, email: 'Network error. Please check your connection and try again.' }))
    } finally {
      setSendingOTP(false)
    }
  }

  /* ─── Verify OTP → Express server ─── */
  const handleVerifyOTP = async () => {
    if (!form.otp) {
      setErrors(e => ({ ...e, otp: 'Enter the 6-digit code sent to your email' }))
      return
    }
    setSendingOTP(true)
    setErrors(e => ({ ...e, otp: '' }))
    try {
      const res = await fetch(`${API}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), otp: form.otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.expired) {
          setErrors(e => ({ ...e, otp: 'Code expired. Click "Verify Email" to get a new one.' }))
          setOtpSent(false)
        } else {
          setErrors(e => ({ ...e, otp: data.error || 'Invalid code. Please try again.' }))
        }
        return
      }
      setEmailVerified(true)
      setOtpSent(false)
      setErrors(e => ({ ...e, otp: '', email: '' }))
    } catch {
      setErrors(e => ({ ...e, otp: 'Network error. Please try again.' }))
    } finally {
      setSendingOTP(false)
    }
  }

  /* ─── Navigation ─── */
  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) handleSubmit()
  }

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const finalCategory =
        form.businessCategory === 'Other (please specify)'
          ? form.customCategory.trim()
          : form.businessCategory

      await addDoc(collection(db, 'vendorWaitlist'), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.toLowerCase().trim(),
        whatsapp: form.whatsapp.trim(),
        businessCategory: finalCategory,
        state: form.state,
        referralCode: form.referralCode.trim() || null,
        emailVerified: true,
        consent: true,
        createdAt: serverTimestamp(),
      })
      setStep(3)
    } catch (err) {
      console.error('Firebase error:', err)
      setErrors({ submit: 'Something went wrong saving your details. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto scrollbar-hide animate-slide-up"
        style={{ animationDuration: '0.4s' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step < 3 ? (
          <>
            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b border-gray-50">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-md shadow-brand/30">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" fillOpacity="0.9"/>
                    <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Join the Vendor Waitlist</h2>
                  <p className="text-xs text-gray-400">Giftseon — Africa's Gift Marketplace</p>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <StepDot step={s} current={step} />
                    <div className="flex-1">
                      <div className={`text-xs font-medium ${step >= s ? 'text-gray-700' : 'text-gray-300'}`}>
                        {s === 1 ? 'Your Details' : 'Business Info'}
                      </div>
                    </div>
                    {s < 2 && (
                      <div className={`w-12 h-px mx-1 transition-colors ${step > s ? 'bg-brand' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form body */}
            <div className="px-7 py-6 space-y-5">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="First Name" required error={errors.firstName}>
                      <input
                        className={`input-field ${errors.firstName ? 'error' : ''}`}
                        placeholder="e.g. Amaka"
                        value={form.firstName}
                        onChange={e => set('firstName', e.target.value)}
                        autoComplete="given-name"
                      />
                    </Field>
                    <Field label="Last Name" required error={errors.lastName}>
                      <input
                        className={`input-field ${errors.lastName ? 'error' : ''}`}
                        placeholder="e.g. Okafor"
                        value={form.lastName}
                        onChange={e => set('lastName', e.target.value)}
                        autoComplete="family-name"
                      />
                    </Field>
                  </div>

                  {/* Email with verify */}
                  <Field label="Email Address" required error={errors.email}>
                    <div className="relative">
                      <input
                        type="email"
                        className={`input-field pr-28 ${errors.email && !emailVerified ? 'error' : ''} ${emailVerified ? 'success' : ''}`}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={e => {
                          set('email', e.target.value)
                          if (emailVerified) { setEmailVerified(false); setOtpSent(false) }
                        }}
                        disabled={emailVerified}
                        autoComplete="email"
                      />
                      {emailVerified ? (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verified
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={sendingOTP || (otpSent && otpTimer > 0)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {sendingOTP
                            ? 'Sending…'
                            : otpSent && otpTimer > 0
                            ? `Resend (${otpTimer}s)`
                            : otpSent ? 'Resend OTP' : 'Verify Email'}
                        </button>
                      )}
                    </div>

                    {/* Sent confirmation */}
                    {otpSent && !emailVerified && (
                      <div className="mt-1.5 p-3 bg-brand/5 border border-brand/20 rounded-xl text-xs text-brand font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Verification code sent — check your inbox (and spam folder)
                      </div>
                    )}
                  </Field>

                  {/* OTP input */}
                  {otpSent && !emailVerified && (
                    <Field label="Enter Verification Code" required error={errors.otp}>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          className={`input-field flex-1 tracking-[0.4em] text-center text-lg font-bold ${errors.otp ? 'error' : ''}`}
                          placeholder="000000"
                          value={form.otp}
                          onChange={e => set('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={sendingOTP}
                          className="btn-primary py-3 px-5 text-sm shrink-0 disabled:opacity-70"
                        >
                          {sendingOTP ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                          ) : 'Confirm'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        A 6-digit code was sent to <strong>{form.email}</strong>
                      </p>
                    </Field>
                  )}

                  {/* WhatsApp */}
                  <Field label="WhatsApp Phone Number" required error={errors.whatsapp}>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-gray-500 select-none pointer-events-none">
                        <span>🇳🇬</span>
                        <span className="text-gray-300">|</span>
                      </div>
                      <input
                        type="tel"
                        className={`input-field pl-16 ${errors.whatsapp ? 'error' : ''}`}
                        placeholder="+234 800 000 0000"
                        value={form.whatsapp}
                        onChange={e => set('whatsapp', e.target.value)}
                        autoComplete="tel"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">We'll send updates and onboarding info via WhatsApp</p>
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Business Category */}
                  <Field label="Business Category" required error={errors.businessCategory}>
                    <select
                      className={`input-field ${errors.businessCategory ? 'error' : ''}`}
                      value={form.businessCategory}
                      onChange={e => set('businessCategory', e.target.value)}
                    >
                      <option value="">Select your category…</option>
                      {BUSINESS_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>

                  {form.businessCategory === 'Other (please specify)' && (
                    <Field label="Describe Your Category" required error={errors.customCategory}>
                      <input
                        className={`input-field ${errors.customCategory ? 'error' : ''}`}
                        placeholder="e.g. Vintage collectibles"
                        value={form.customCategory}
                        onChange={e => set('customCategory', e.target.value)}
                      />
                    </Field>
                  )}

                  {/* State */}
                  <Field label="State of Business" required error={errors.state}>
                    <select
                      className={`input-field ${errors.state ? 'error' : ''}`}
                      value={form.state}
                      onChange={e => set('state', e.target.value)}
                    >
                      <option value="">Select your state…</option>
                      {NIGERIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>

                  {/* Referral */}
                  <Field label="Referral Code" error={null}>
                    <input
                      className="input-field"
                      placeholder="Optional — enter a referral code"
                      value={form.referralCode}
                      onChange={e => set('referralCode', e.target.value)}
                    />
                  </Field>

                  {/* Consent */}
                  <div className="space-y-1.5">
                    <label className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                      form.consent ? 'border-brand/40 bg-brand/4' : errors.consent ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="relative shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={form.consent}
                          onChange={e => set('consent', e.target.checked)}
                        />
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          form.consent ? 'bg-brand border-brand' : 'border-gray-300 bg-white'
                        }`}>
                          {form.consent && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed select-none">
                        I consent to Giftseon collecting and using my details for smooth onboarding when the platform goes live. I agree to receive live updates, exclusive vendor news, and communications via email and WhatsApp. I understand I can opt out at any time.
                      </p>
                    </label>
                    {errors.consent && (
                      <p className="text-xs text-red-500">{errors.consent}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-7 pb-7 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="btn-primary py-3.5 px-8 flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting…
                  </>
                ) : step === 1 ? (
                  <>
                    Continue
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                ) : (
                  <>
                    Join Waitlist
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="px-7 pb-5">
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.submit}
                </p>
              </div>
            )}
          </>
        ) : (
          /* ─── Success state ─── */
          <div className="px-7 py-12 text-center">
            <div className="w-20 h-20 bg-brand rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand/30 animate-float">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">You're on the list! 🎉</h3>
            <p className="text-gray-500 text-base mb-2">
              Welcome, <strong>{form.firstName}</strong>! You've secured your spot as an early Giftseon vendor.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              We'll reach out via <strong>{form.email}</strong> and WhatsApp as soon as we go live with your exclusive early access details.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { val: '0%', label: 'Platform Fee\n(3 months)' },
                { val: '#1', label: 'Featured\nPlacement' },
                { val: '1st', label: 'Priority\nOnboarding' },
              ].map(({ val, label }) => (
                <div key={val} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="text-2xl font-bold text-brand">{val}</div>
                  <div className="text-xs text-gray-400 mt-1 whitespace-pre-line leading-4">{label}</div>
                </div>
              ))}
            </div>

            <button onClick={onClose} className="btn-primary w-full py-3.5">
              Back to Homepage
            </button>

            <p className="text-xs text-gray-300 mt-4">Share with friends to move up the list</p>
          </div>
        )}
      </div>
    </div>
  )
}
