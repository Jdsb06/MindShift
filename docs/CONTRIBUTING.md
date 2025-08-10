# Contributing

Thanks for considering a contribution to MindShift!

## How to contribute
1. Fork the repo and create a feature branch from `main`.
2. Run locally with emulators (see `GETTING_STARTED.md`).
3. Keep changes focused and add notes to the README/docs as needed.
4. Ensure no console errors and basic functionality works.
5. Open a PR describing changes, reasoning, and test notes.

## Coding guidelines
- Prefer small, composable React components
- Keep UI snappy: leverage transitions and keep re-renders minimal
- Use Firestore listeners (`onSnapshot`) for real-time experiences where relevant
- Validate `context.auth` in callable functions and fail fast on invalid input
- Avoid committing secrets; use env or functions config

## Commit style
- Conventional-ish messages appreciated (e.g., `feat:`, `fix:`, `docs:`)

## Issues
- When filing, include steps to reproduce and environment details
