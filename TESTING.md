# Testing

This project favors integration tests using Firebase emulators and a lightweight browser-based harness.

## Backend tests
- File: `backend/test-functions.js`
- Run:
```bash
cd backend
npm test
```

## Frontend integration harness
- A console utility `MindShiftFunctionTester` exists at `frontend/src/utils/functionTests.js`.
- Run it from the browser console after signing in:
```js
new window.MindShiftFunctionTester().runAllTests()
```

## Manual testing checklist
- Auth: sign up, log in, log out (email/password, optional Google OAuth)
- Momentum logs: add, list (real-time), delete
- Compass goals: edit and persist
- AI: generate momentum summary and weekly reflection via Dashboard actions
- Notion (optional): connect token, fetch events, create a task

## Emulator UI
- Use http://localhost:4001 to inspect Firestore, Auth, and Function calls

## Frontend checks
- No console errors
- Responsive layout
- Smooth transitions
- Dark mode visuals
