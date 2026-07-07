# Deploying Express + Mongoose Backend to Render

## Render Web Service Setup

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `server` (if monorepo) |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` (or `node --experimental-strip-types server.ts`) |
| **Instance Type** | Free tier is fine for dev/MVP |

---

## Environment Variables on Render

In Render dashboard → Your service → Environment tab, add every key from your `.env.example`:

```
PORT=10000               ← Render sets this automatically, but define anyway
MONGO_URI=mongodb+srv://...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

> **Firebase private key on Render**: paste the key with literal `\n` characters (not real newlines). The `.replace(/\\n/g, '\n')` in `config/firebase.js` handles the conversion.

---

## MongoDB Atlas — Allow Render's IP

MongoDB Atlas blocks unknown IPs by default. For Render:

**Option A (quick, less secure):** Whitelist `0.0.0.0/0` in Atlas → Network Access
**Option B (more secure):** Render paid plans offer static outbound IPs — add those to Atlas

---

## Health Check

Render pings your app to know it's alive. Make sure this route exists in `app.js`:

```js
app.get('/health', (req, res) => res.json({ status: 'ok' }));
```

In Render → Health & Alerts → set Health Check Path to `/health`.

---

## Monorepo: Frontend (Vercel) + Backend (Render)

```
my-project/
├── client/   → Deploy to Vercel (React)
└── server/   → Deploy to Render (Express)
```

**Vercel config** (in Vercel dashboard or `vercel.json`):
- Root Directory: `client`
- Framework: Vite/Create React App

**Frontend environment variable:**
```env
VITE_API_URL=https://your-backend.onrender.com
```

**CORS in backend must allow Vercel domain:**
```js
app.use(cors({ origin: process.env.CLIENT_URL }));
```

---

## Common Render Issues

| Problem | Fix |
|---|---|
| Deploy fails: "Cannot find module" | Make sure `type: "module"` is in `package.json` and imports use `.js` extensions |
| App crashes immediately | Check Render logs; usually a missing env var or MongoDB connection failure |
| Cold start is slow (free tier) | Normal — free Render services sleep after 15min inactivity. Paid tier fixes this |
| Firebase key error | Check the `\n` handling in `config/firebase.js` |
| CORS errors from frontend | Set `CLIENT_URL` env var in Render and use it in `cors({ origin })` |
