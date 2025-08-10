# API Reference (Cloud Functions)

All functions are HTTPS callable and require Firebase Authentication unless noted.

Base (emulator, local dev):
- Functions: http://localhost:5001
- Emulator UI: http://localhost:4001

In production, callable functions are invoked via the Firebase SDK, not raw HTTP.

## generateMomentumSummary
- Method: callable
- Auth: required
- Input: none
- Output:
```
{
  summary: string,
  tagAnalysis?: Record<string, number>,
  goalProgress?: Record<string, number>,
  totalEntries?: number,
  taggedEntries?: number,
  goalLinkedEntries?: number
}
```
- Behavior: Fetches last 7 days of `/users/{uid}/momentumLogs`, builds a short, encouraging summary using Gemini. Falls back to a deterministic summary if AI isn’t available.

## generateWeeklyReflection
- Method: callable
- Auth: required
- Input: none
- Output:
```
{
  reflection: string,
  insights: string[],
  recommendations: string[],
  stats: {
    totalEntries: number,
    activeDays: number,
    topTag: string | null,
    topGoal: string | null,
    tagCounts: Record<string, number>,
    goalCounts: Record<string, number>
  }
}
```
- Behavior: Composes a weekly reflection from user goals + recent logs.

## saveNotionConfig
- Method: callable
- Auth: required
- Input:
```
{
  accessToken: string,
  calendarDatabaseId?: string,
  tasksDatabaseId?: string
}
```
- Output: `{ success: true }`
- Behavior: Stores Notion credentials for the user under `/users/{uid}/integrations/notion`.

## fetchNotionEvents
- Method: callable
- Auth: required
- Input:
```
{
  maxDays?: number // default 14
}
```
- Output:
```
{
  events: Array<{
    id: string,
    title: string,
    start: string | null,
    end: string | null,
    description: string,
    source: 'notion'
  }>
}
```
- Behavior: Queries a Notion database with a Date property and returns upcoming events.

## createNotionTask
- Method: callable
- Auth: required
- Input:
```
{
  title: string,
  due?: string | Date
}
```
- Output:
```
{ id: string }
```
- Behavior: Creates a simple page (task) in the configured Notion tasks database.

## createUserProfile (Auth trigger)
- Method: `functions.auth.user().onCreate`
- Behavior: Seeds a profile with default compass goals.
