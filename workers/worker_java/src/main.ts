import { env } from './config/env.config';
import { createSubmissionWorker } from './jobs/queue';
import { closePool } from './utils/db';

async function bootstrap() {
  console.log(`[${env.workerName}] Bootstrapping...`);
  const worker = createSubmissionWorker();

  worker.on('ready', () => {
    console.log(`[${env.workerName}] Ready and listening for jobs`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[${env.workerName}] Received ${signal}, shutting down...`);
    await worker.close();
    await closePool();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error(`[${env.workerName}] Failed to start worker`, error);
  process.exit(1);
});
