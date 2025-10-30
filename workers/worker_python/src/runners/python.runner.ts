import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import { performance } from 'node:perf_hooks';
import {
  SubmissionCaseStatus,
  SubmissionResultCase,
  SubmissionResultPayload,
  SubmissionStatus,
  TestCase,
} from '../types/submission.type';
import { createSandboxDir, removeSandboxDir } from '../utils/sandbox';

interface RunnerOptions {
  timeLimitMs: number;
}

interface CaseExecutionResult extends SubmissionResultCase {}

export class PythonRunner {
  constructor(private readonly options: RunnerOptions) {}

  async run(code: string, testCases: TestCase[]): Promise<SubmissionResultPayload> {
    const sandbox = await createSandboxDir();
    const scriptPath = join(sandbox, 'main.py');

    await fs.writeFile(scriptPath, code, 'utf8');

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

    try {
      for (const testCase of casesToRun) {
        const result = await this.executeCase(scriptPath, testCase);
        totalTime += result.timeMs;
        cases.push(result);

        if (result.status !== 'OK') {
          // Stop on first failure to conserve resources
          break;
        }
      }
    } finally {
      await removeSandboxDir(sandbox);
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

  private executeCase(scriptPath: string, testCase: TestCase): Promise<CaseExecutionResult> {
    return new Promise((resolve) => {
      const start = performance.now();
      const subprocess = spawn('python3', [scriptPath], {
        cwd: dirname(scriptPath),
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { PYTHONUNBUFFERED: '1' },
      });

      let stdout = '';
      let stderr = '';
      let resolved = false;
      let timeoutHandle: NodeJS.Timeout | undefined;

      const finish = (status: SubmissionCaseStatus, error?: string) => {
        if (resolved) return;
        resolved = true;
        if (timeoutHandle) clearTimeout(timeoutHandle);

        const end = performance.now();
        resolve({
          caseId: testCase.id,
          status,
          timeMs: Math.round(end - start),
          output: stdout,
          expectedOutput: testCase.expectedOutput,
          error,
        });
      };

      subprocess.stdout.setEncoding('utf8');
      subprocess.stdout.on('data', (chunk: string) => {
        stdout += chunk;
      });

      subprocess.stderr.setEncoding('utf8');
      subprocess.stderr.on('data', (chunk: string) => {
        stderr += chunk;
      });

      subprocess.on('error', (error) => {
        finish('RUNTIME_ERROR', error.message);
      });

      subprocess.on('close', (code) => {
        if (resolved) return;

        const normalizedStdout = normalize(stdout);
        const normalizedExpected = normalize(testCase.expectedOutput);

        if (code === 0) {
          if (normalizedStdout === normalizedExpected) {
            finish('OK');
          } else {
            finish('WRONG_ANSWER');
          }
        } else {
          const errorMessage = stderr.trim() || `Process exited with code ${code}`;
          if (errorMessage.includes('SyntaxError')) {
            finish('COMPILATION_ERROR', errorMessage);
          } else {
            finish('RUNTIME_ERROR', errorMessage);
          }
        }
      });

      timeoutHandle = setTimeout(() => {
        subprocess.kill('SIGKILL');
        finish('TIME_LIMIT_EXCEEDED', `Exceeded ${this.options.timeLimitMs}ms limit`);
      }, this.options.timeLimitMs);

      subprocess.stdin.write(testCase.input ?? '');
      subprocess.stdin.end();
    });
  }
}

const normalize = (value: string) => value.replace(/\r/g, '').trim();
