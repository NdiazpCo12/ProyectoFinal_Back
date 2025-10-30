import { ConnectionOptions } from 'bullmq';
import { env } from './env.config';

export const redisConnection: ConnectionOptions = {
  host: env.redisHost,
  port: env.redisPort,
  password: env.redisPassword,
  db: env.redisDb,
};
