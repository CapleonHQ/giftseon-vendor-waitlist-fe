require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Resend } = require('resend')
const admin = require('firebase-admin')

/* ── Firebase Admin init ── */
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
})
const db = admin.firestore()

/* ── Resend client ── */
const resend = new Resend(process.env.RESEND_API_KEY)

/* ── Express setup ── */
const app = express()
app.use(express.json())
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['POST'],
}))

/* ── Helpers ── */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/* ────────────────────────────────────────────
   POST /api/send-otp
   Body: { email: string }
──────────────────────────────────────────── */
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' })
  }

  const normalised = email.toLowerCase().trim()

  try {
    /* ── Check duplicate waitlist entry ── */
    const existing = await db
      .collection('vendorWaitlist')
      .where('email', '==', normalised)
      .limit(1)
      .get()

    if (!existing.empty) {
      return res.status(409).json({ error: 'This email is already on the waitlist.' })
    }

    /* ── Rate limit: 3 OTPs per email per hour ── */
    const otpRef = db.collection('otpCodes').doc(normalised)
    const otpDoc = await otpRef.get()
    const now = Date.now()
    const ONE_HOUR = 60 * 60 * 1000

    if (otpDoc.exists) {
      const data = otpDoc.data()
      const withinWindow = now - (data.windowStart || 0) < ONE_HOUR
      if (withinWindow && (data.attempts || 0) >= 3) {
        return res.status(429).json({ error: 'Too many requests. Please wait before trying again.' })
      }
    }

    /* ── Generate & store OTP ── */
    const otp = generateOTP()
    const expiresAt = now + 10 * 60 * 1000 // 10 minutes

    const prevData = otpDoc.exists ? otpDoc.data() : {}
    const withinWindow = now - (prevData.windowStart || 0) < ONE_HOUR

    await otpRef.set({
      otp,
      expiresAt,
      verified: false,
      attempts: withinWindow ? (prevData.attempts || 0) + 1 : 1,
      windowStart: withinWindow ? (prevData.windowStart || now) : now,
    })

    /* ── Send email via Resend ── */
    const { error: resendError } = await resend.emails.send({
      from: 'Giftseon Vendors <vendors@giftseon.com>',
      to: [normalised],
      subject: 'Your Giftseon Vendor Waitlist Verification Code',
      html: buildEmailHTML(otp),
    })

    if (resendError) {
      console.error('Resend error:', resendError)
      return res.status(500).json({ error: 'Failed to send verification email. Please try again.' })
    }

    return res.json({ success: true, message: 'Verification code sent to your email.' })
  } catch (err) {
    console.error('send-otp error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

/* ────────────────────────────────────────────
   POST /api/verify-otp
   Body: { email: string, otp: string }
──────────────────────────────────────────── */
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' })
  }

  const normalised = email.toLowerCase().trim()

  try {
    const otpRef = db.collection('otpCodes').doc(normalised)
    const otpDoc = await otpRef.get()

    if (!otpDoc.exists) {
      return res.status(404).json({ error: 'No verification code found. Please request a new one.' })
    }

    const data = otpDoc.data()

    if (Date.now() > data.expiresAt) {
      await otpRef.delete()
      return res.status(410).json({ expired: true, error: 'This code has expired. Please request a new one.' })
    }

    if (data.otp !== otp.trim()) {
      return res.status(401).json({ error: 'Invalid verification code.' })
    }

    await otpRef.update({ verified: true })
    return res.json({ verified: true })
  } catch (err) {
    console.error('verify-otp error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

/* ── Health check ── */
app.get('/health', (_, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ Giftseon OTP server running on port ${PORT}`)
})

/* ── Email template ── */
function buildEmailHTML(otp) {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
      <body style="margin:0;padding:0;background:#f8f9ff;font-family:'Inter',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(26,26,188,0.08);">

                <tr>
                  <td style="background:#1a1abc;padding:32px 40px;text-align:center;">
                    <span style="color:#ffffff;font-size:22px;font-weight:700;">🎁 Giftseon Vendors</span>
                  </td>
                </tr>

                <tr>
                  <td style="padding:40px 40px 32px;">
                    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0f0f1a;">Verify your email address</h1>
                    <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                      Use the code below to complete your vendor waitlist registration.
                      This code expires in <strong>10 minutes</strong>.
                    </p>

                    <div style="background:#f0f0ff;border:2px dashed #1a1abc;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#1a1abc;text-transform:uppercase;letter-spacing:0.1em;">Your verification code</p>
                      <div style="font-size:44px;font-weight:800;color:#1a1abc;letter-spacing:0.3em;line-height:1;">${otp}</div>
                    </div>

                    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                      If you didn't request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

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
  `
}
