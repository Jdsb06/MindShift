# Security

## Reporting a vulnerability
If you discover a security issue, please do not file a public issue. Instead, email the maintainers or open a private disclosure (e.g., via GitHub Security Advisories) so we can triage and fix.

## Secrets
- Do not commit secrets to the repo
- Frontend never needs the Gemini API key
- Use environment variables or `firebase functions:config` for sensitive keys

## Data protection
- Per-user Notion tokens are stored under the user document in Firestore
- Callable functions verify `context.auth` and operate per-user
- Follow Firestore rules to ensure least-privilege access
