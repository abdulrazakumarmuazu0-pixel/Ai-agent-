# Firebase Setup — `ai-agent-dee1a`

I've wired the whole codebase to Firebase Auth (Email/Password + Google)
and Firestore. There are a few things I genuinely cannot do from here
because this sandbox has no network access — they take about 5 minutes
in the Firebase Console. Everything else is already done in the code.

## 1. Register a Web App (I can't do this — no network access)

1. Go to https://console.firebase.google.com/project/ai-agent-dee1a/settings/general
2. Scroll to **Your apps** → click the **`</>`** (Web) icon.
3. Give it a nickname (e.g. "AI Agent Web"). You don't need Firebase Hosting.
4. Click **Register app**. Firebase shows you a config object like:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "ai-agent-dee1a.firebaseapp.com",
     projectId: "ai-agent-dee1a",
     storageBucket: "ai-agent-dee1a.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
5. Open `frontend/js/firebase-config.js` and paste in the real `apiKey`,
   `messagingSenderId`, and `appId` (the other three are already filled
   in correctly since your project ID is known).

## 2. Enable the two sign-in providers

Go to https://console.firebase.google.com/project/ai-agent-dee1a/authentication/providers

- **Email/Password** → Enable → Save.
- **Google** → Enable → pick a support email → Save.

## 3. Add authorized domains

Same Authentication page → **Settings** tab → **Authorized domains**.
`localhost` is there by default (fine for local dev). Add your real
production domain once you deploy the frontend somewhere.

## 4. Deploy the Firestore security rules

I added `firestore.rules` at the project root (users can only read/write
their own documents; role/plan/limits/usage can't be self-escalated).
Your backend uses the Admin SDK, which bypasses these rules entirely —
they only matter if you ever add direct client-side Firestore access.
Still worth deploying:

```bash
npm install -g firebase-tools   # if you don't have it
firebase login
firebase use ai-agent-dee1a
firebase deploy --only firestore:rules
```

(If you don't have a `firebase.json` yet, run `firebase init firestore`
first and point it at `firestore.rules`.)

## 5. Backend — nothing new needed

Your backend already had `firebase-admin` configured with
`FIREBASE_PROJECT_ID` / `FIREBASE_PRIVATE_KEY` / `FIREBASE_CLIENT_EMAIL`
in `.env`, pointing at Firestore. That's unchanged — it's what verifies
ID tokens from the client and reads/writes the `users` collection.

## 6. Run it

```bash
cd backend && npm install && npm run dev
# serve frontend/ with any static server, e.g.:
npx http-server frontend -p 8080
```

---

## What changed in the code, and why

Your original backend had a security bug: `/api/auth/login` looked up
the user by email but **never checked the password** — anyone could log
in as anyone by knowing their email. It also had no path for Google
Sign-In at all.

**New flow:**
- The **frontend** now calls the Firebase Auth SDK directly
  (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`,
  `signInWithPopup(googleProvider)`). Firebase verifies the password (or
  Google credential) — the backend never sees a raw password.
- The frontend gets a Firebase **ID token** and sends it as
  `Authorization: Bearer <idToken>` to `/api/auth/register` (first time)
  or `/api/auth/login` (returning user), which just syncs the Firestore
  profile.
- The backend's `authenticate` middleware now verifies that ID token
  with `firebase-admin`'s `verifyIdToken()` instead of a custom JWT —
  every other route (`chat`, `files`, `search`, `memory`, `admin`) used
  that same middleware already, so they all got fixed for free.
- Removed the now-unused `jsonwebtoken` / `bcryptjs` dependencies from
  `backend/package.json`.
- Added a "Continue with Google" button to the auth screen
  (`frontend/index.html`, styled in `styles.css`), backed by
  `firebase-auth-compat.js` loaded via CDN — no build step needed since
  your frontend is plain JS/HTML.

Files touched: `backend/middleware/auth.js`, `backend/routes/auth.js`,
`backend/utils/validators.js`, `backend/package.json`,
`frontend/index.html`, `frontend/js/firebase-config.js` (new),
`frontend/js/auth.js`, `frontend/js/api-client.js`, `frontend/js/app.js`,
`frontend/js/i18n.js`, `frontend/css/styles.css`, `firestore.rules` (new).
