# Local Development Workflow

## Prerequisites
- Node.js 18
- Firebase CLI (`npm i -g firebase-tools`)
- Gemini API key (see ENVIRONMENT.md)

## One-time setup
```bash
npm --prefix frontend install
npm --prefix backend install
firebase login
```

## Start everything
```bash
# Shell A: emulators
firebase emulators:start --only functions,firestore,auth

# Shell B: frontend
cd frontend
npm run dev
```

## Tips
- Frontend auto-connects to emulators when on `localhost`.
- Use the Emulator UI at http://localhost:4001 to inspect Firestore, Auth, and Functions.
- Keep `GEMINI_API_KEY` set or use `functions:config` for AI calls.

## Testing changes
- Frontend console harness:
```js
new window.MindShiftFunctionTester().runAllTests()
```
- Or run backend tests:
```bash
cd backend
npm test
```

## Common tasks
- Lint (frontend): `npm run lint`
- Build (frontend): `npm run build`
- Functions shell: `npm run shell` (backend)
- Logs: `npm run logs` (backend)
