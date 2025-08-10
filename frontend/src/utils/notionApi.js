import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export async function saveNotionConfig({ accessToken, calendarDatabaseId, tasksDatabaseId }) {
  const fn = httpsCallable(functions, 'saveNotionConfig');
  const res = await fn({ accessToken, calendarDatabaseId, tasksDatabaseId });
  return res.data;
}

export async function fetchNotionEvents({ maxDays = 14 } = {}) {
  const fn = httpsCallable(functions, 'fetchNotionEvents');
  const res = await fn({ maxDays });
  return res.data?.events || [];
}

export async function createNotionTask({ title, due }) {
  const fn = httpsCallable(functions, 'createNotionTask');
  const res = await fn({ title, due });
  return res.data;
}
