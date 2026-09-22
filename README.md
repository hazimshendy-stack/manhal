# Manhal

   Resala STEM Sub Branches — Season 7

   ## Setup

   1. Firebase project: https://console.firebase.google.com
   2. Enable **Authentication → Email/Password**
   3. Enable **Firestore Database** (production mode)
   4. Copy `.env.example` → `.env` and fill Firebase config
   5. Publish Firestore rules (from `docs/FIRESTORE_RULES.md`)
   6. `npm install && npm run dev`

   ## Deploy to GitHub Pages

   1. Push to GitHub
   2. Repository → Settings → Pages → Source: **GitHub Actions**
   3. Add `VITE_FIREBASE_*` as repository secrets
   4. Actions will auto-deploy on every push to `main`

   ## PWA

   Installable as a mobile app:
   - Android: Chrome → ⋮ → "Install app"
   - iOS: Safari → Share → "Add to Home Screen"

   ## Admin bootstrap

   1. Create the first HEAD account manually in Firebase Console
   2. Log in → /admin → Upload Data
   