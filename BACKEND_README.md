# MindShift Backend - Firebase Setup

This describes the backend as it exists in this repo and how to run or deploy it.

## Implemented capabilities

- Cloud Functions (Node 18)
  - `generateMomentumSummary` (callable)
  - `generateWeeklyReflection` (callable)
  - `saveNotionConfig` (callable)
  - `fetchNotionEvents` (callable)
  - `createNotionTask` (callable)
  - `createUserProfile` (Auth onCreate trigger)
- Firestore
  - `/users/{uid}` with `compassGoals`, metadata
  - `/users/{uid}/momentumLogs/{logId}` for accomplishments
  - Optional `/users/{uid}/integrations/notion`
- AI via Google Gemini (`@google/generative-ai`)
  - Model: `gemini-1.5-flash`
  - Key loaded from `backend/config.js`, `functions.config().gemini.key`, or `GEMINI_API_KEY`

## Key files

- `backend/index.js` — functions implementation
- `backend/config.example.js` — local template; copy to `backend/config.js`
- `backend/test-functions.js` — basic integration checks
- `firebase.json` — emulators, hosting, functions config
- `firestore.rules`, `firestore.indexes.json` — security/indexes

## Local run

Prereqs: Node 18, Firebase CLI

1) Install dependencies
```bash
npm --prefix backend install
```

2) Provide Gemini key (pick one)
```bash
# A) Local file (development only)
cp backend/config.example.js backend/config.js
# then edit backend/config.js and set GEMINI_API_KEY

# B) Firebase runtime config (recommended)
firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
```

3) Start emulators (ports are in firebase.json)
```bash
firebase emulators:start --only functions,firestore,auth
```

## Deploy

```bash
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## Data examples

User document
```json
{
  "email": "user@example.com",
  "createdAt": "<Timestamp>",
  "compassGoals": { "goal1": "...", "goal2": "...", "goal3": "..." }
}
```

Momentum log document
```json
{
  "text": "Finished reading a chapter.",
  "tags": ["reading"],
  "linkedGoal": "goal1",
  "createdAt": "<Timestamp>"
}
```

## Security notes

- Callable functions require `context.auth`
- Notion tokens are stored per-user and never exposed to other users
- Keep Gemini keys out of the frontend