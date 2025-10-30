import { Job } from 'bullmq';
import { env } from '../config/env.config';
import { CppRunner } from '../runners/c++.runner';
import {
  SubmissionJob,
  SubmissionResultPayload,
} from '../types/submission.type';
import {
  fetchTestCases,
  updateSubmissionStatus,
} from '../utils/db';

const runner = new CppRunner({
  timeLimitMs: env.timeLimitMs,
  memoryLimitMb: env.memoryLimitMb,
});

export async function processSubmissionJob(
  job: Job<SubmissionJob>,
): Promise<SubmissionResultPayload> {
  const { data } = job;

  await updateSubmissionStatus(data.id, 'RUNNING');

  const language = (data.language ?? '').toLowerCase();
  if (language !== 'c++' && language !== 'cpp' && language !== 'cxx') {
    const unsupported: SubmissionResultPayload = {
      status: 'RUNTIME_ERROR',
      timeMsTotal: 0,
      score: 0,
      cases: [],
    };

    await updateSubmissionStatus(data.id, unsupported.status, unsupported);
    job.log(`Unsupported language "${data.language}" for C++ worker.`);
    return unsupported;
  }

  try {
    const testCases = await fetchTestCases(data.challengeId);
    const result = await runner.run(data.code, testCases);
    await updateSubmissionStatus(data.id, result.status, result);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const failure: SubmissionResultPayload = {
      status: 'RUNTIME_ERROR',
      timeMsTotal: 0,
      score: 0,
      cases: [
        {
          caseId: 'internal-error',
          status: 'RUNTIME_ERROR',
          timeMs: 0,
          output: '',
          expectedOutput: '',
          error: message,
        },
      ],
    };

    await updateSubmissionStatus(data.id, failure.status, failure);
    job.log(`Unhandled error processing submission ${data.id}: ${message}`);
    throw error;
  }
}
