# Security

## Reporting a vulnerability
If you discover a security issue, please do not file a public issue. Instead, email the maintainers or open a private disclosure so we can triage and fix.

## Secrets
- Never commit secrets to the repo
- Frontend must not include Gemini API keys
- Prefer `firebase functions:config` or server-side environment variables

## Data protection
- Per-user Notion tokens are stored under the user document in Firestore
- Callable functions verify `context.auth` and operate per-user
- Follow `firestore.rules` for least-privilege access

## Optional analytics
- Analytics/telemetry is not required for functionality; add only if needed and document any data collected
