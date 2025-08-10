# Environment & Configuration

This project supports configuration through environment variables, Firebase Functions runtime config, and a local config file (optional for development).

## Sources of configuration (priority order)

1. Environment variables (e.g., `GEMINI_API_KEY`)
2. Firebase Functions runtime config (e.g., `functions:config set gemini.key=...`)
3. `backend/config.js` (local, gitignored). A template exists as `backend/config.example.js`.

## Required values

- Gemini API key (AI features):
  - `GEMINI_API_KEY` environment variable, or
  - `firebase functions:config:set gemini.key="<your-key>"`

## Frontend Firebase web config

- File: `frontend/src/firebase.js`
- Replace with your Firebase Web App config if you use your own project ID.
- The app automatically connects to emulators when on `localhost`.

## Emulator ports

Configured in `firebase.json`:
- Auth: 9099
- Firestore: 8081
- Functions: 5001
- Emulator UI: 4001

## Production notes

- Set `gemini.key` in your production project before deploy.
- Keep private keys out of the frontend and out of Git history. The frontend never needs the Gemini key.
