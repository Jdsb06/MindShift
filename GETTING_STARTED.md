# MindShift - Local Setup Guide (Run on localhost)

This guide helps anyone clone the repo and run MindShift locally with their own API keys. It covers prerequisites, environment setup, Firebase emulators, and how to launch the frontend and backend.

If you hit issues, see the Troubleshooting section at the end.

## Prerequisites

- Node.js 18.x (recommended via nvm) and npm
- Firebase CLI: npm install -g firebase-tools
- Git (to clone the repo)
- API keys/tokens you plan to use:
  - Google Gemini API key (required for AI features)
  - Optional: Notion integration token (per-user; saved via the app)

## Quick start (TL;DR)

```bash
# 1) Clone and enter the repo
git clone <your-fork-or-repo-url>.git
cd MindShift

# 2) Install deps
npm --prefix frontend install
npm --prefix backend install

# 3) Login to Firebase (one-time)
firebase login

# 4) Provide your Gemini API key to Functions (local only)
# Option A: environment variable for this terminal session
export GEMINI_API_KEY="your-gemini-key"

# Option B: Firebase Functions runtime config (also works in emulator)
firebase functions:config:set gemini.key="your-gemini-key"

# 5) Start Firebase emulators (Auth, Firestore, Functions)
firebase emulators:start --only functions,firestore,auth

# 6) In a new terminal, start the frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Emulator UI: http://localhost:4001
- Functions (local): http://localhost:5001
- Firestore (local): http://localhost:8081
- Auth (local): http://localhost:9099

## Project layout

- frontend/ - React (Vite), Tailwind
- backend/ - Firebase Cloud Functions (Node 18)
- firebase.json - Firebase config and emulator ports
- firestore.rules / firestore.indexes.json - DB rules and indexes
- docs/ - Additional internal docs

## Configure API keys

MindShift uses Gemini for AI summaries/reflections. The backend reads the key in this order:

1) Environment variable GEMINI_API_KEY
2) Firebase Functions config gemini.key
3) backend/config.js default

Pick one of these approaches for local dev:

- Fastest: export GEMINI_API_KEY before you start the emulators.
- Alternative: set Firebase Functions config (persists for the emulator; also used when you deploy).

Optional Notion setup: Users store their own Notion token via the app (saved under users/{uid}/integrations/notion). You do not need to set a global key.

## Frontend Firebase config

- File: frontend/src/firebase.js
- The file includes a Firebase web config for project ID mindshift-206.
- For local development with the emulators, you can keep this as-is. The code automatically connects to local Auth, Firestore, and Functions when running on localhost.
- To use your own Firebase project:
  1) Create a Firebase project in the console and add a Web App.
  2) Copy the web app config (apiKey, authDomain, projectId, etc.).
  3) Replace the values in frontend/src/firebase.js.

Note: The frontend does NOT need your Gemini key; that is only used by the backend function.

## Run locally - detailed steps

1) Install dependencies

```bash
npm --prefix frontend install
npm --prefix backend install
```

2) Provide your Gemini key

- Option A (env var, current shell only):

```bash
export GEMINI_API_KEY="your-gemini-key"
```

- Option B (Firebase Functions config):

```bash
firebase functions:config:set gemini.key="your-gemini-key"
```

3) Start emulators from repo root

```bash
firebase emulators:start --only functions,firestore,auth
```

4) Start frontend in a new terminal

```bash
cd frontend
npm run dev
```

5) Open the app

- http://localhost:5173
- Sign up or log in, add Momentum logs, try "Generate My Vibe ✨"

## Common tasks

- Run backend callable tests (if available): from backend/, run npm test
- View emulator UI: http://localhost:4001
- Check function logs: firebase functions:log (or emulator terminal output)

## Production deployment (optional)

Before deploying, ensure the gemini.key is set in Functions config for your Firebase project:

```bash
firebase functions:config:set gemini.key="your-production-gemini-key"
```

Then deploy:

```bash
# Backend
firebase deploy --only functions

# Firestore rules
firebase deploy --only firestore:rules

# Frontend build + hosting (firebase.json predeploy builds frontend)
firebase deploy --only hosting
```

## Troubleshooting

- "API key not valid" or empty AI responses
  - Ensure GEMINI_API_KEY is exported or functions:config gemini.key is set.
  - Restart emulators after changing env/config.

- "Unable to connect to localhost:9099/8081/5001"
  - Start emulators with: firebase emulators:start --only functions,firestore,auth

- Frontend not loading
  - Ensure npm run dev is running in frontend/ and visit the shown URL.

- Using your own Firebase project
  - Update frontend/src/firebase.js with your web app config.
  - Run firebase login and firebase use <your-project-id> before deploy.

## Notes

- Node version is pinned to 18 for Functions (see backend/package.json engines.node).
- Emulator ports are configured in firebase.json. If a port is busy, stop the process or edit the port there.
- More in-depth run/deployment info is available in docs/README_RUN.md.

---

If you need additional help or want this guide customized for your cloud provider or CI, open an issue or PR.
