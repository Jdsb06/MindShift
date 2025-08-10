# Notion Integration

MindShift supports an optional Notion integration per user. Tokens are stored under the user’s document and are never shared globally.

## Data location
```
/users/{uid}/integrations/notion
  accessToken: string
  calendarDatabaseId?: string
  tasksDatabaseId?: string
  connectedAt: Timestamp
```

## Cloud functions
- `saveNotionConfig` — Stores `accessToken` and optional database IDs.
- `fetchNotionEvents` — Reads upcoming events from a Notion database with a Date property.
- `createNotionTask` — Creates a simple page (task) in a configured tasks database.

## Frontend helpers
Located at `frontend/src/utils/notionApi.js`:
- `saveNotionConfig({ accessToken, calendarDatabaseId, tasksDatabaseId })`
- `fetchNotionEvents({ maxDays = 14 })`
- `createNotionTask({ title, due })`

## Requirements
- Users must provide their own Notion integration token.
- Databases should include the expected properties (e.g., Title/Name and Date).

## Security
- Tokens are per-user; callable endpoints require Firebase Auth and operate on behalf of the user.
