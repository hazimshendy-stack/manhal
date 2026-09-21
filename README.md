# sbapiaryy v5.1

Resala STEM Sub Branches — Season 7

## Setup

1. Firebase project: https://console.firebase.google.com
2. Enable **Authentication → Email/Password**
3. Enable **Firestore Database** (production mode)
4. Copy `.env.example` → `.env` and fill Firebase config
5. Publish Firestore rules (docs/FIRESTORE_RULES.md)
6. `npm install && npm run dev`

## Deploy to GitHub Pages

1. Push to GitHub
2. Settings → Pages → Source: **GitHub Actions**
3. Add VITE_FIREBASE_* as repository secrets
4. Actions will auto-deploy

## PWA

الموقع قابل للتثبيت كتطبيق على الجوال:
- Android: Chrome → ⋮ → "Install app"
- iOS: Safari → Share → "Add to Home Screen"

## Admin Bootstrap

1. Sign up on /login
2. Firebase Console → Firestore → `users` → set your `role` = `HEAD`
3. Reload → Admin → "Load Demo Data"
