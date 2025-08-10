# 🧪 MindShift Function Test Summary

This summarizes what’s covered by available tests and how to run them.

## What exists today

- Frontend utility `MindShiftFunctionTester` (browser console) exercises:
  - Authentication (signup/login/logout)
  - User profile presence
  - Compass goals CRUD
  - Momentum logs CRUD + real-time updates
  - AI summary via `generateMomentumSummary`
  - Basic error handling checks
- Backend script `backend/test-functions.js`:
  - Firestore write/read
  - Gemini prompt construction (no live call)

## How to run

1) Start emulators
```bash
firebase emulators:start --only functions,firestore,auth
```

2) Frontend tests in browser
- Open the app at http://localhost:5173
- Open DevTools Console and run:
```js
new window.MindShiftFunctionTester().runAllTests()
```

3) Backend test script (optional)
```bash
cd backend
npm test
```

## Notes

- Ensure a Gemini key is configured (see ENVIRONMENT.md) for AI functions
- Tests are integration-focused and use the emulators
- There is no dedicated "Test Functions" UI button; use the console utility above