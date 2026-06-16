import { hydrateHcmState, persistHcmState } from './persistence';

export async function withHcmPersistence<T>(fn: () => Promise<T>): Promise<T> {
  await hydrateHcmState();
  const result = await fn();
  await persistHcmState();
  return result;
}
