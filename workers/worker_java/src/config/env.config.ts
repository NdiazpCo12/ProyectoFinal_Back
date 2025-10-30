import { config } from 'dotenv';

config();

const toNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  workerName: process.env.WORKER_NAME ?? 'worker-java',
  redisHost: process.env.REDIS_HOST ?? 'redis',
  redisPort: toNumber(process.env.REDIS_PORT, 6379),
  redisPassword: process.env.REDIS_PASSWORD,
  redisDb: toNumber(process.env.REDIS_DB, 0),
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@db:5432/backend?schema=public',
  timeLimitMs: toNumber(process.env.TIME_LIMIT_MS, 5000),
  memoryLimitMb: toNumber(process.env.MEMORY_LIMIT_MB, 256),
};
