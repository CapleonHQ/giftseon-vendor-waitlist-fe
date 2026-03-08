const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { setGlobalOptions } = require('firebase-functions/v2')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')
const { Resend } = require('resend')

admin.initializeApp()

// Store Resend API key as a Firebase Secret (never exposed to client)
const RESEND_API_KEY = defineSecret('RESEND_API_KEY')

setGlobalOptions({ region: 'us-central1' })

/* ─────────────────────────────────────────────
   Callable: sendOTP
   Called by the frontend when user clicks "Verify Email"
   Generates a 6-digit OTP, stores it in Firestore (with 10-min TTL),
   then sends it via Resend.
───────────────────────────────────────────── */
exports.sendOTP = onCall(
  { secrets: [RESEND_API_KEY] },
  async (request) => {
    const { email } = request.data

    // ── Validate email ──
    if (!email || typeof email !== 'string') {
      throw new HttpsError('invalid-argument', 'A valid email address is required.')
    }
    const normalised = email.toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalised)) {
      throw new HttpsError('invalid-argument', 'Invalid email format.')
    }

    // ── Check for duplicate waitlist entry ──
    const db = admin.firestore()
    const existing = await db
      .collection('vendorWaitlist')
      .where('email', '==', normalised)
      .limit(1)
      .get()

    if (!existing.empty) {
      throw new HttpsError('already-exists', 'This email is already on the waitlist.')
    }

    // ── Rate limit: max 3 OTP requests per email per hour ──
    const otpRef = db.collection('otpCodes').doc(normalised)
    const otpDoc = await otpRef.get()
    const now = Date.now()

    if (otpDoc.exists) {
      const data = otpDoc.data()
      const attempts = data.attempts || 0
      const windowStart = data.windowStart || 0
      const ONE_HOUR = 60 * 60 * 1000

      if (now - windowStart < ONE_HOUR && attempts >= 3) {
        throw new HttpsError(
          'resource-exhausted',
          'Too many OTP requests. Please wait before trying again.'
        )
      }
    }

    // ── Generate 6-digit OTP ──
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = now + 10 * 60 * 1000 // 10 minutes

    // ── Store OTP in Firestore ──
    await otpRef.set({
      otp,
      expiresAt,
      verified: false,
      attempts: (otpDoc.exists && now - (otpDoc.data().windowStart || 0) < 3600000)
        ? (otpDoc.data().attempts || 0) + 1
        : 1,
      windowStart: otpDoc.exists && now - (otpDoc.data().windowStart || 0) < 3600000
        ? otpDoc.data().windowStart
        : now,
    })

    // ── Send email via Resend ──
    const resend = new Resend(RESEND_API_KEY.value())

    const { error } = await resend.emails.send({
      from: 'Giftseon merchants <merchants@giftseon.com>',
      to: [normalised],
      subject: 'Your Giftseon Vendor Waitlist Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </head>
          <body style="margin:0;padding:0;background:#f8f9ff;font-family:'Inter',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;padding:40px 16px;">
              <tr>
                <td align="center">
                  <table width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(26,26,188,0.08);">

                    <!-- Header -->
                    <tr>
                      <td style="background:#1a1abc;padding:32px 40px;text-align:center;">
                        <div style="display:inline-flex;align-items:center;gap:10px;">
                          <div style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:10px;display:inline-block;vertical-align:middle;line-height:36px;text-align:center;">
                            🎁
                          </div>
                          <span style="color:#ffffff;font-size:20px;font-weight:700;vertical-align:middle;">Giftseon merchants</span>
                        </div>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px 40px 32px;">
                        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f0f1a;">
                          Verify your email address
                        </h1>
                        <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                          Use the code below to verify your email and complete your vendor waitlist registration. This code expires in <strong>10 minutes</strong>.
                        </p>

                        <!-- OTP Box -->
                        <div style="background:#f0f0ff;border:2px dashed #1a1abc;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                          <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#1a1abc;text-transform:uppercase;letter-spacing:0.1em;">Your verification code</p>
                          <div style="font-size:42px;font-weight:800;color:#1a1abc;letter-spacing:0.25em;line-height:1;">${otp}</div>
                        </div>

                        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                          If you didn't request this code, you can safely ignore this email. Someone may have entered your email by mistake.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f0f0f0;">
                        <p style="margin:0;font-size:12px;color:#d1d5db;text-align:center;">
                          © ${new Date().getFullYear()} Giftseon · Nigeria's Gift Marketplace
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      throw new HttpsError('internal', 'Failed to send verification email. Please try again.')
    }

    return { success: true, message: 'Verification code sent to your email.' }
  }
)

/* ─────────────────────────────────────────────
   Callable: verifyOTP
   Called when the user submits their 6-digit code.
   Returns { verified: true } on success.
───────────────────────────────────────────── */
exports.verifyOTP = onCall(async (request) => {
  const { email, otp } = request.data

  if (!email || !otp) {
    throw new HttpsError('invalid-argument', 'Email and OTP are required.')
  }

  const normalised = email.toLowerCase().trim()
  const db = admin.firestore()
  const otpRef = db.collection('otpCodes').doc(normalised)
  const otpDoc = await otpRef.get()

  if (!otpDoc.exists) {
    throw new HttpsError('not-found', 'No verification code found. Please request a new one.')
  }

  const data = otpDoc.data()

  // ── Check expiry ──
  if (Date.now() > data.expiresAt) {
    await otpRef.delete()
    throw new HttpsError('deadline-exceeded', 'This code has expired. Please request a new one.')
  }

  // ── Check code ──
  if (data.otp !== otp.trim()) {
    throw new HttpsError('unauthenticated', 'Invalid verification code.')
  }

  // ── Mark as verified ──
  await otpRef.update({ verified: true })

  return { verified: true }
})
