# Testing

This project uses a lightweight approach focused on integration testing with Firebase emulators.

## Backend tests
- File: `backend/test-functions.js`
- Run:
```bash
cd backend
npm test
```

## Manual testing checklist
- Auth: sign up, log in, log out
- Momentum logs: add, list (real-time), delete
- Compass goals: edit and persist
- AI: generate momentum summary and weekly reflection
- Notion: connect token, fetch events, create a task (if configured)

## Emulator UI
- Use http://localhost:4001 to inspect Firestore, Auth, and Functions invocations

## Frontend checks
- No console errors
- Responsive layout
- Smooth transitions
- Dark mode visuals
