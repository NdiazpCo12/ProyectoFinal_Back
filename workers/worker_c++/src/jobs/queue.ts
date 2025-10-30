import { Worker } from 'bullmq';
import { env } from '../config/env.config';
import { redisConnection } from '../config/redis.config';
import { processSubmissionJob } from './processor';
import { SubmissionJob } from '../types/submission.type';

export function createSubmissionWorker() {
  const worker = new Worker<SubmissionJob>('submissions', processSubmissionJob, {
    connection: redisConnection,
    concurrency: 1,
  });

  worker.on('completed', (job) => {
    console.log(
      `[${env.workerName}] Completed job ${job.id} (${job.data.language})`,
    );
  });

  worker.on('failed', (job, error) => {
    if (!job) return;
    console.error(
      `[${env.workerName}] Failed job ${job.id} (${job.data.language}): ${error?.message}`,
    );
  });

  worker.on('error', (error) => {
    console.error(`[${env.workerName}] Worker error: ${error.message}`);
  });

  return worker;
}
