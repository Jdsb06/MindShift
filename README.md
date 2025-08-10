# MindShift

Trade mindless scrolling for meaningful progress.

A modern, Gen Z–friendly productivity app that helps you build momentum through intentional actions, effortless logging, and a little AI magic.

<p align="center">
  <img src="frontend/public/logo.svg" alt="MindShift Logo" width="80" />
</p>

<p align="center">
  <a href="https://nodejs.org/en">Node 18</a> · <a href="https://react.dev/">React + Vite</a> · <a href="https://firebase.google.com/">Firebase (Auth, Firestore, Functions)</a> · <a href="https://ai.google.dev/">Gemini</a>
</p>

## Overview

MindShift connects the dots between your daily actions and your deeper “why.”
- Attention Swap: a fast pattern-interrupt to reset focus
- Momentum Log: a shame-free done list with real-time updates
- Compass Goals: keep your top 3 goals front-and-center
- AI Magic: personalized reflections and weekly insights via Gemini
- Optional Notion integration for events/tasks

## Why MindShift (the motive)

The world is optimized for distraction. Endless feeds reward mindless consumption over meaningful creation. Traditional productivity tools often amplify guilt and overwhelm. MindShift flips that script.

- The problem
  - We lose hours to low-intent scrolling and feel worse, not better.
  - To-do lists become anxiety lists; we forget to celebrate what we did.
  - Goals drift to the background and rarely shape daily choices.

- Our approach
  - Pattern interrupt, not shame: a one-tap Attention Swap to reset your state.
  - Momentum over perfection: log small wins; watch confidence compound.
  - Compass-first decisions: keep your 3 core goals always visible.
  - Gentle AI coaching: short, human-friendly reflections—never prescriptive.

- Who it’s for
  - Students, makers, indie hackers, and anyone who wants intentional days.
  - People who prefer calm, fast, delightful tools without bloat.

- Design principles
  - Minimalist core, maximalist personality: clean structure with tasteful flair.
  - Dark-mode first with curated accents; micro-animations for flow.
  - Shame-free language; clarity over jargon; speed over ceremony.

## Monorepo structure

- `frontend/` — React 19 (Vite), Tailwind
- `backend/` — Firebase Cloud Functions (Node 18), Gemini, Notion client
- `firebase.json` — Hosting, functions, and emulator config
- `firestore.rules`, `firestore.indexes.json` — DB security + indexes
- `docs/` — Additional run and deployment docs

## Tech stack

- Frontend: React (Vite), Tailwind CSS, React Router
- Backend: Firebase (Auth, Firestore, Cloud Functions)
- AI: Gemini (Google Generative AI)

## Quick start

Prefer the full step-by-step? See `GETTING_STARTED.md`.

```bash
# From the repo root
npm --prefix frontend install
npm --prefix backend install

# Provide your Gemini key (choose one)
export GEMINI_API_KEY="your-gemini-key"
# or
firebase functions:config:set gemini.key="your-gemini-key"

# Start Firebase emulators (Auth, Firestore, Functions)
firebase emulators:start --only functions,firestore,auth

# In a new terminal: start the frontend
cd frontend
npm run dev
# Open the printed localhost URL (usually http://localhost:5173)
```

## Features

- Attention Swap overlay with calming visuals and short prompts
- Momentum Log with real-time updates (Firestore onSnapshot)
- Compass Goals (your top three, always visible and editable)
- AI-powered summaries and weekly reflections (Gemini)
- Tagging and goal-linking for logs to surface patterns
- Optional Notion integration for events and tasks
- Dark mode first, smooth transitions, curated accent themes

## Architecture

- Frontend: React + Vite, Tailwind, React Router
- Backend: Firebase Cloud Functions (Node 18)
- Data: Firestore (users, momentumLogs)
- Auth: Firebase Auth (email/password, Google)
- AI: Gemini (server-side via Cloud Functions)
- Optional: Notion API (per-user token stored securely in Firestore)

Emulators are configured in `firebase.json`:
- Auth: 9099 · Firestore: 8081 · Functions: 5001 · Emulator UI: 4001

## Data model

Users are stored at `/users/{uid}`. Logs live in a subcollection.

```javascript
// /users/{uid}
{
  email: string,
  createdAt: Timestamp,
  compassGoals: { goal1: string, goal2: string, goal3: string }
}

// /users/{uid}/momentumLogs/{logId}
{
  text: string,
  createdAt: Timestamp,
  tags?: string[],
  linkedGoal?: 'goal1' | 'goal2' | 'goal3'
}
```

Notion integration (per user): `/users/{uid}/integrations/notion` stores `accessToken`, optional database IDs.

## Cloud Functions API

- `generateMomentumSummary` (callable)
  - Auth required. Summarizes the last 7 days of logs via Gemini, with a graceful fallback if AI is unavailable.
- `generateWeeklyReflection` (callable)
  - Auth required. Longer weekly reflection with insights/recommendations.
- `saveNotionConfig` (callable)
  - Auth required. Saves a user’s Notion `accessToken` and optional database IDs.
- `fetchNotionEvents` (callable)
  - Auth required. Reads events from a Notion database (date property) for the next N days.
- `createNotionTask` (callable)
  - Auth required. Creates a simple task page in a Notion database.
- `createUserProfile` (auth trigger)
  - On sign-up, seeds a user profile and default goals.

Backend entrypoint: `backend/index.js`.

## Configuration

- Gemini API key (required for AI features):
  - `export GEMINI_API_KEY="<key>"` (preferred for local dev), or
  - `firebase functions:config:set gemini.key="<key>"` (works in emulator and prod)
- Frontend Firebase web config: `frontend/src/firebase.js`
  - Includes defaults for the sample project ID. To use your own Firebase project, replace the config with your Web App credentials.
- Optional local file: `backend/config.example.js` → copy to `config.js` if you prefer file-based keys during development. `.gitignore` already excludes `config.js`.

## Developer scripts

Frontend (`frontend/package.json`):
- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview built app locally
- `npm run lint` — ESLint

Backend (`backend/package.json`):
- `npm run serve` — Start Functions emulator (see root `firebase.json`)
- `npm run shell` — Functions shell
- `npm start` — Alias to shell
- `npm run deploy` — Deploy Cloud Functions
- `npm run logs` — Stream function logs
- `npm test` — Run callable tests in `test-functions.js`

## Running locally (recommended)

- Use the emulators for rapid feedback and safe testing
- Frontend auto-connects to emulators when on `localhost`
- See `GETTING_STARTED.md` for a full walkthrough

## Deployment

Before your first deploy, set the production Gemini key:

```bash
firebase functions:config:set gemini.key="your-production-gemini-key"
```

Deploy in parts or all at once:

```bash
# Functions
firebase deploy --only functions

# Firestore rules
firebase deploy --only firestore:rules

# Hosting (frontend). firebase.json predeploy builds the app
firebase deploy --only hosting
```

## Troubleshooting

- API key errors: ensure `GEMINI_API_KEY` or `functions:config gemini.key` is set; restart emulators
- Emulator ports busy: stop the process or adjust ports in `firebase.json`
- Frontend not loading: run `npm run dev` in `frontend/` and open the printed URL
- See `docs/README_RUN.md` for deeper diagnostics and commands

## Contributing

Issues and PRs welcome. If you add a new feature, include a quick usage note and, if relevant, emulator/test coverage.

---

Need a step-by-step local guide? See `GETTING_STARTED.md`. For long-form docs, see `docs/`.