import { promises as fs } from 'fs';
import { join, dirname } from 'path';
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
  memoryLimitMb: number;
}

export class JavaRunner {
  constructor(private readonly options: RunnerOptions) {}

  async run(code: string, testCases: TestCase[]): Promise<SubmissionResultPayload> {
    const sandbox = await createSandboxDir();
    const sourcePath = join(sandbox, 'Main.java');

    await fs.writeFile(sourcePath, code, 'utf8');

    const compilation = await this.compile(sourcePath);
    if (compilation.status !== 'OK') {
      await removeSandboxDir(sandbox);
      return {
        status: 'COMPILATION_ERROR',
        timeMsTotal: compilation.timeMs,
        score: 0,
        cases: [compilation],
      };
    }

    const cases: SubmissionResultCase[] = [];
    let totalTime = compilation.timeMs;

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
        const result = await this.executeCase(sandbox, testCase);
        totalTime += result.timeMs;
        cases.push(result);

        if (result.status !== 'OK') {
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

  private compile(sourcePath: string): Promise<SubmissionResultCase> {
    return new Promise((resolve) => {
      const start = performance.now();
      const compiler = spawn('javac', ['Main.java'], {
        cwd: dirname(sourcePath),
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stderr = '';

      compiler.stderr.setEncoding('utf8');
      compiler.stderr.on('data', (chunk: string) => {
        stderr += chunk;
      });

      compiler.on('close', (code) => {
        const end = performance.now();
        if (code === 0) {
          resolve({
            caseId: 'compilation',
            status: 'OK',
            timeMs: Math.round(end - start),
            output: '',
            expectedOutput: '',
          });
        } else {
          resolve({
            caseId: 'compilation',
            status: 'COMPILATION_ERROR',
            timeMs: Math.round(end - start),
            output: '',
            expectedOutput: '',
            error: stderr.trim() || `javac exited with code ${code}`,
          });
        }
      });

      compiler.on('error', (error) => {
        const end = performance.now();
        resolve({
          caseId: 'compilation',
          status: 'COMPILATION_ERROR',
          timeMs: Math.round(end - start),
          output: '',
          expectedOutput: '',
          error: error.message,
        });
      });
    });
  }

  private executeCase(directory: string, testCase: TestCase): Promise<SubmissionResultCase> {
    return new Promise((resolve) => {
      const start = performance.now();
      const javaProcess = spawn(
        'java',
        [
          `-Xmx${this.options.memoryLimitMb}m`,
          '-Xms32m',
          'Main',
        ],
        {
          cwd: directory,
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      );

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

      javaProcess.stdout.setEncoding('utf8');
      javaProcess.stdout.on('data', (chunk: string) => {
        stdout += chunk;
      });

      javaProcess.stderr.setEncoding('utf8');
      javaProcess.stderr.on('data', (chunk: string) => {
        stderr += chunk;
      });

      javaProcess.on('error', (error) => {
        finish('RUNTIME_ERROR', error.message);
      });

      javaProcess.on('close', (code) => {
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
          const errorMessage = stderr.trim() || `java exited with code ${code}`;
          finish('RUNTIME_ERROR', errorMessage);
        }
      });

      timeoutHandle = setTimeout(() => {
        javaProcess.kill('SIGKILL');
        finish(
          'TIME_LIMIT_EXCEEDED',
          `Exceeded ${this.options.timeLimitMs}ms limit`,
        );
      }, this.options.timeLimitMs);

      javaProcess.stdin.write(testCase.input ?? '');
      javaProcess.stdin.end();
    });
  }
}

const normalize = (value: string) => value.replace(/\r/g, '').trim();
