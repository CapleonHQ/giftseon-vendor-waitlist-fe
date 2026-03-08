# Deployment Guide — Giftseon Vendor Waitlist

## Architecture
```
Frontend (Vite/React)  →  Express server (server/)  →  Resend API
                       ↘  Firestore (vendorWaitlist, otpCodes)
```
No Firebase Blaze plan required. Firebase free Spark plan works fine.

---

## 1. Firebase service account key
Download from: **Firebase Console → Project Settings → Service Accounts → Generate new private key**

Save the JSON file as `server/serviceAccountKey.json`
(already in `.gitignore` — never commit this file)

---

## 2. Create server/.env
```bash
cp server/.env.example server/.env
```
Fill in:
```
RESEND_API_KEY=re_xxxxxxxxxxxx       # from resend.com/api-keys
FIREBASE_PROJECT_ID=giftseon
ALLOWED_ORIGIN=https://yourdomain.com
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
```

---

## 3. Verify your sending domain in Resend
- Go to resend.com → Domains → Add domain → `giftseon.com`
- Add the DNS records they provide
- Update `from:` in `server/index.js` to match your verified domain

---

## 4. Run locally
```bash
# Terminal 1 — frontend
yarn dev

# Terminal 2 — OTP server
cd server && node index.js
```

---

## 5. Deploy to production

### Option A — Railway (recommended, free tier)
```bash
# From the server/ directory
railway init
railway up
```
Set env vars in Railway dashboard. Copy the deployed URL.

### Option B — Render (free tier)
- Connect your GitHub repo
- Set root directory to `server/`
- Start command: `node index.js`
- Add env vars in the Render dashboard

### Option C — Any VPS / server
```bash
cd server && npm install
node index.js   # or use PM2: pm2 start index.js
```

---

## 6. Update frontend with deployed server URL
Add to your root `.env`:
```
VITE_API_URL=https://your-server-url.railway.app
```
Then rebuild: `yarn build`

---

## Firestore collections
| Collection | Purpose |
|---|---|
| `vendorWaitlist` | One doc per signup |
| `otpCodes` | Temp OTP storage — 10-min TTL, rate-limited 3/hour |
