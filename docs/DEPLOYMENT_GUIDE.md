# 🚀 MindShift Deployment Guide

This guide covers deploying the frontend (Vite) and backend (Firebase Functions, Firestore rules).

## Options

### Option 1: Firebase Hosting (Frontend + Backend)

1. Upgrade Firebase plan if using Functions at scale (Blaze recommended)
2. Set Functions runtime config for Gemini
```bash
firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
```
3. Deploy
```bash
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

### Option 2: Vercel/Netlify (Frontend) + Firebase (Backend)

- Deploy backend to Firebase (same as above)
- For frontend host:
  - Build command: `npm run build`
  - Publish dir: `frontend/dist`
  - Environment variables (if you use your own Firebase project):
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_FIREBASE_STORAGE_BUCKET`
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`
    - `VITE_FIREBASE_APP_ID`

## Environment

- Backend: `functions:config().gemini.key`
- Frontend: uses Firebase Web config only (no Gemini key in frontend)

## Emulator/Ports

From `firebase.json`:
- Functions: 5001
- Firestore: 8081
- Auth: 9099
- Emulator UI: 4001

## Post-deploy checks

- Auth flows (email/password, optional Google OAuth)
- Firestore reads/writes
- Callable functions: `generateMomentumSummary`, `generateWeeklyReflection`, Notion functions (if used)
- CORS/Hosting rewrites (single-page app)

## Monitoring

- Logs: `firebase functions:log`
- Emulator UI locally for debugging
- Optional: add analytics/tracing if needed; not required for functionality