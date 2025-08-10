# Environment & Configuration

Configuration sources (priority order):
1. Environment variables (e.g., `GEMINI_API_KEY` for local/dev shells)
2. Firebase Functions runtime config (`functions:config().gemini.key`)
3. `backend/config.js` (local, gitignored; see `backend/config.example.js`)

## Required values

- Gemini API key (AI features):
  - `GEMINI_API_KEY` env var or
  - `firebase functions:config:set gemini.key="<your-key>"` or
  - `backend/config.js` exporting `{ GEMINI_API_KEY: '...' }`

## Frontend Firebase web config

- File: `frontend/src/firebase.js`
- Replace with your Firebase Web App config if not using the default project ID
- The app connects to emulators on localhost automatically

## Emulator ports (firebase.json)
- Auth: 9099
- Firestore: 8081
- Functions: 5001
- Emulator UI: 4001

## Production
- Set `gemini.key` in your production project before deploy
- Keep private keys server-side only; the frontend never needs Gemini keys
