import { performance } from 'node:perf_hooks';
import {
  SubmissionCaseStatus,
  SubmissionResultCase,
  SubmissionResultPayload,
  SubmissionStatus,
  TestCase,
} from '../types/submission.type';
import { runDockerContainer } from '../utils/docker-runner';

interface RunnerOptions {
  timeLimitMs: number;
  memoryLimitMb: number;
}

export class JavaRunner {
  private readonly imageName = 'java-runner:latest';

  constructor(private readonly options: RunnerOptions) {}

  async run(code: string, testCases: TestCase[]): Promise<SubmissionResultPayload> {
    const cases: SubmissionResultCase[] = [];
    let totalTime = 0;

    const casesToRun = testCases.length
      ? testCases
      : [
          {
            id: 'synthetic-0',
            input: '',
            expectedOutput: '',
            isHidden: true,
          },
        ];

    for (const testCase of casesToRun) {
      const result = await this.executeCase(code, testCase);
      totalTime += result.timeMs;
      cases.push(result);

      if (result.status !== 'OK') {
        break;
      }
    }

    const allPassed = cases.every((item) => item.status === 'OK');
    const status = this.resolveSubmissionStatus(cases);

    return {
      status: allPassed ? 'ACCEPTED' : status,
      timeMsTotal: totalTime,
      score: allPassed ? 100 : 0,
      cases,
    };
  }

  private resolveSubmissionStatus(cases: SubmissionResultCase[]): SubmissionStatus {
    const failing = cases.find((item) => item.status !== 'OK');
    if (!failing) return 'ACCEPTED';

    switch (failing.status) {
      case 'WRONG_ANSWER':
        return 'WRONG_ANSWER';
      case 'TIME_LIMIT_EXCEEDED':
        return 'TIME_LIMIT_EXCEEDED';
      case 'COMPILATION_ERROR':
        return 'COMPILATION_ERROR';
      default:
        return 'RUNTIME_ERROR';
    }
  }

  private async executeCase(code: string, testCase: TestCase): Promise<SubmissionResultCase> {
    const start = performance.now();

    try {
      const result = await runDockerContainer({
        image: this.imageName,
        code,
        input: testCase.input ?? '',
        codeFileName: 'Main.java',
        timeLimitMs: this.options.timeLimitMs,
        memoryLimitMb: this.options.memoryLimitMb,
      });

      const end = performance.now();
      const timeMs = Math.round(end - start);

      const normalizedStdout = normalize(result.stdout);
      const normalizedExpected = normalize(testCase.expectedOutput);

      let status: SubmissionCaseStatus;
      let error: string | undefined;

      if (result.timedOut || result.exitCode === 124) {
        status = 'TIME_LIMIT_EXCEEDED';
        error = `Exceeded ${this.options.timeLimitMs}ms limit`;
      } else if (result.exitCode !== 0) {
        const errorMessage = result.stderr.trim() || result.stdout.trim();
        if (errorMessage.includes('error:') || errorMessage.includes('compilation failed')) {
          status = 'COMPILATION_ERROR';
          error = errorMessage;
        } else {
          status = 'RUNTIME_ERROR';
          error = errorMessage || `Process exited with code ${result.exitCode}`;
        }
      } else if (normalizedStdout === normalizedExpected) {
        status = 'OK';
      } else {
        status = 'WRONG_ANSWER';
      }

      return {
        caseId: testCase.id,
        status,
        timeMs,
        output: normalizedStdout,
        expectedOutput: testCase.expectedOutput,
        error,
      };
    } catch (error) {
      const end = performance.now();
      return {
        caseId: testCase.id,
        status: 'RUNTIME_ERROR',
        timeMs: Math.round(end - start),
        output: '',
        expectedOutput: testCase.expectedOutput,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

const normalize = (value: string) => value.replace(/\r/g, '').trim();
