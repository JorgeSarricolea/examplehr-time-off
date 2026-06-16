import { Redis } from '@upstash/redis';
import {
  applyPersistedBlob,
  HCM_MOCK_PERSISTENCE_KEY,
  snapshotHcmState,
  type PersistedHcmBlob,
} from './persisted-blob';
import { getHcmState, resetHcmState } from './store';

const PERSISTENCE_TTL_SECONDS = 60 * 60 * 24 * 7;

export function isKvPersistenceEnabled(): boolean {
  if (process.env.HCM_MOCK_STORE !== 'kv') return false;
  return Boolean(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
      (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
  );
}

function createRedisClient(): Redis {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv();
  }

  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function hydrateHcmState(): Promise<void> {
  if (!isKvPersistenceEnabled()) return;

  const redis = createRedisClient();
  const blob = await redis.get<PersistedHcmBlob>(HCM_MOCK_PERSISTENCE_KEY);

  resetHcmState();
  if (blob) {
    applyPersistedBlob(getHcmState(), blob);
  }
}

export async function persistHcmState(): Promise<void> {
  if (!isKvPersistenceEnabled()) return;

  const redis = createRedisClient();
  const blob = snapshotHcmState(getHcmState());
  await redis.set(HCM_MOCK_PERSISTENCE_KEY, blob, { ex: PERSISTENCE_TTL_SECONDS });
}

export async function clearPersistedHcmState(): Promise<void> {
  if (!isKvPersistenceEnabled()) return;

  const redis = createRedisClient();
  await redis.del(HCM_MOCK_PERSISTENCE_KEY);
}
