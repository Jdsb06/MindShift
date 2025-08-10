# Firebase Emulators

Fast local iteration without touching production.

## Services and ports
- Functions: 5001
- Firestore: 8081
- Auth: 9099
- UI: 4001

Start:
```bash
firebase emulators:start --only functions,firestore,auth
```

## Frontend connection
In `frontend/src/firebase.js`, the app connects to emulators when running on `localhost`:
- `connectFunctionsEmulator(functions, 'localhost', 5001)`
- `connectFirestoreEmulator(db, 'localhost', 8081)`
- `connectAuthEmulator(auth, 'http://localhost:9099')`

## Inspect and debug
- Open the Emulator UI at http://localhost:4001
- Watch logs in terminal where emulators run

## Data persistence
- Emulator data is in-memory by default. Export/import via the UI or CLI if you need persistence between runs.
