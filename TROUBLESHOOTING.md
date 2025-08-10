# Troubleshooting

## Common issues

### API key not valid / AI calls fail
- Ensure `GEMINI_API_KEY` is exported or `functions:config gemini.key` is set
- Restart emulators after changing env/config

### Emulator ports busy
- Check ports 5001, 8081, 9099, 4001
- Kill stale processes or change ports in `firebase.json`

### Frontend not loading
- Run `npm run dev` in `frontend/` and open the printed URL
- Check terminal for Vite errors

### Emulator connection errors
- Start: `firebase emulators:start --only functions,firestore,auth`
- Confirm UI at http://localhost:4001

### Firestore permission errors
- Check `firestore.rules` and your signed-in user

## Deeper diagnostics
- `firebase functions:log`
- Start emulators with `--debug`
- Use Network tab in DevTools for callable responses
