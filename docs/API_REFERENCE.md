# API Reference (Cloud Functions)

All documented functions are callable HTTPS functions and require Firebase Authentication unless noted. Use the Firebase SDK from the frontend rather than raw HTTP.

## Base (emulator, local dev)
- Functions: http://localhost:5001
- Emulator UI: http://localhost:4001

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
- Notes: Uses Gemini (`gemini-1.5-flash`); falls back to deterministic summary if AI isn’t available.
 - Frontend usage:
   ```js
   import { httpsCallable } from 'firebase/functions';
   import { functions } from '../src/firebase';
   const fn = httpsCallable(functions, 'generateMomentumSummary');
   const { data } = await fn();
   console.log(data.summary);
   ```

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
 - Frontend usage:
   ```js
   const fn = httpsCallable(functions, 'generateWeeklyReflection');
   const { data } = await fn();
   console.log(data.reflection, data.insights, data.recommendations);
   ```

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
 - Frontend usage:
   ```js
   const fn = httpsCallable(functions, 'saveNotionConfig');
   await fn({ accessToken, calendarDatabaseId, tasksDatabaseId });
   ```

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
- Notes: Expects a Notion database with a Date property named "Date" and a Title/Name property.
 - Frontend usage:
   ```js
   const fn = httpsCallable(functions, 'fetchNotionEvents');
   const { data } = await fn({ maxDays: 14 });
   console.table(data.events);
   ```

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
- Output: `{ id: string }`
 - Frontend usage:
   ```js
   const fn = httpsCallable(functions, 'createNotionTask');
   const { data } = await fn({ title: 'Read book', due: new Date() });
   console.log('Created task', data.id);
   ```

## createUserProfile (Auth trigger)
- Method: `functions.auth.user().onCreate`
- Behavior: Seeds a user profile with default compass goals
