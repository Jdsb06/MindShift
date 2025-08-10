# Architecture

MindShift is a modern web app that pairs a lightweight React frontend with Firebase for backend services. AI features run server-side via Google Gemini, exposed as callable Cloud Functions.

## High-level overview

- Frontend: React 19 + Vite + Tailwind CSS, running on localhost:5173 in dev
- Backend: Firebase Cloud Functions (Node.js 18)
- Data: Firestore (users + momentum logs)
- Auth: Firebase Authentication
- AI: Gemini (Google Generative AI) via `@google/generative-ai`
- Optional integration: Notion API (per-user tokens stored in Firestore)

## Module map

- `frontend/`
  - `src/components/` — UI components (modals, overlays, widgets)
  - `src/pages/` — App routes (Dashboard, Calendar, etc.)
  - `src/utils/` — Utilities, Firebase callable wrappers, calendar helpers
  - `src/firebase.js` — Web SDK init + emulator connections
- `backend/`
  - `index.js` — Cloud Function entrypoint
  - `config.js` — Local config (gitignored); see `config.example.js`
  - `package.json` — Functions runtime dependencies + scripts

## Data model

```
/users/{uid}
  email: string
  createdAt: Timestamp
  compassGoals: { goal1: string, goal2: string, goal3: string }

/users/{uid}/momentumLogs/{logId}
  text: string
  createdAt: Timestamp
  tags?: string[]
  linkedGoal?: 'goal1' | 'goal2' | 'goal3'
```

Optional Notion integration per-user:
```
/users/{uid}/integrations/notion
  accessToken: string
  calendarDatabaseId?: string
  tasksDatabaseId?: string
  connectedAt: Timestamp
```

## Cloud Functions

- Callable HTTPS
  - `generateMomentumSummary`
  - `generateWeeklyReflection`
  - `saveNotionConfig`
  - `fetchNotionEvents`
  - `createNotionTask`
- Auth triggers
  - `createUserProfile` – seeds a user profile on first sign-up

## Environments

- Local: Firebase Emulators (functions:5001, firestore:8081, auth:9099, ui:4001)
- Production: Firebase Hosting + Cloud Functions + Firestore + Auth

## Security & auth

- Frontend uses Firebase Auth (email/password, optional Google OAuth)
- Cloud Functions validate `context.auth` for callable endpoints
- Firestore security rules live in `firestore.rules`

## Build/deploy

- Frontend built by Vite; hosted by Firebase Hosting
- Backend deployed via Firebase CLI (`firebase deploy --only functions`)
- Emulator ports and hosting rewrites configured in `firebase.json`
