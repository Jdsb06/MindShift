# 🚀 MindShift - Complete Run Guide

This guide walks you through running the MindShift project.

## Prerequisites
- Node.js 18+
- npm
- Firebase CLI (`npm install -g firebase-tools`)
- Gemini API Key (for AI features)

## Start locally

1) Install deps
```bash
npm --prefix frontend install
npm --prefix backend install
```

2) Configure Gemini key (choose one)
```bash
# Local file for dev
echo "module.exports = { GEMINI_API_KEY: 'YOUR_KEY' }" > backend/config.js
# or Functions runtime config (recommended)
firebase functions:config:set gemini.key="YOUR_KEY"
```

3) Start emulators (ports from firebase.json)
```bash
firebase emulators:start --only functions,firestore,auth
```

4) Start frontend in another shell
```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Emulator UI: http://localhost:4001
- Functions: http://localhost:5001
- Firestore: http://localhost:8081
- Auth: http://localhost:9099

## Testing

- In the browser console (after signing in):
```js
new window.MindShiftFunctionTester().runAllTests()
```
- Optional backend script:
```bash
cd backend
npm test
```

## Troubleshooting
- Ensure emulators are running (see ports above)
- Verify Gemini key is configured
- Check `frontend/src/firebase.js` connects to emulators on localhost