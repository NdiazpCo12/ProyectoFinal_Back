import { spawn, execSync } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

interface DockerRunOptions {
  image: string;
  code: string;
  input: string;
  codeFileName: string;
  timeLimitMs: number;
  memoryLimitMb?: number;
}

interface DockerRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
}

function getHostPathFromVolume(containerPath: string): string {
  try {
    const containerName = process.env.WORKER_NAME || 'worker_python';
    const inspectOutput = execSync(`docker inspect ${containerName}`, { encoding: 'utf8' });
    const mounts = JSON.parse(inspectOutput)[0]?.Mounts || [];
    
    const sandboxMount = mounts.find((m: any) => 
      m.Destination === '/app/.sandbox' && m.Type === 'volume'
    );
    
    if (sandboxMount && sandboxMount.Source) {
      const relativePath = containerPath.replace('/app/.sandbox', '').replace(/^\//, '');
      return join(sandboxMount.Source, relativePath).replace(/\\/g, '/');
    }
  } catch (error) {
    console.error('Error getting host path from volume:', error);
  }
  return containerPath;
}

export async function runDockerContainer(
  options: DockerRunOptions,
): Promise<DockerRunResult> {
  const sandboxDir = join('/app', '.sandbox', `runner-${randomUUID()}`);
  await fs.mkdir(sandboxDir, { recursive: true, mode: 0o700 });

  const codePath = join(sandboxDir, options.codeFileName);
  const inputPath = join(sandboxDir, 'input.txt');

  try {
    await fs.writeFile(codePath, options.code, 'utf8');
    await fs.writeFile(inputPath, options.input, 'utf8');

    const hostSandboxPath = getHostPathFromVolume(sandboxDir);
    const timeoutSeconds = Math.ceil(options.timeLimitMs / 1000) + 1;
    
    const dockerArgs = [
      'run',
      '--rm',
      '--network', 'none',
      '--cpus', '0.5',
      '--memory', `${options.memoryLimitMb || 512}m`,
      '--read-only',
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=100m',
      '-v', `${hostSandboxPath}:/app:ro`,
      '--entrypoint', '/bin/sh',
      options.image,
      '-c', `cat /app/input.txt | timeout ${timeoutSeconds}s /runner.sh || exit $?`
    ];

    return await executeDocker(dockerArgs, options.timeLimitMs);
  } finally {
    await fs.rm(sandboxDir, { recursive: true, force: true }).catch(() => {});
  }
}

function executeDocker(
  args: string[],
  timeLimitMs: number,
): Promise<DockerRunResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const dockerProcess = spawn('docker', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let resolved = false;
    let timeoutHandle: NodeJS.Timeout | undefined;

    const finish = (exitCode: number, timedOut: boolean = false) => {
      if (resolved) return;
      resolved = true;
      if (timeoutHandle) clearTimeout(timeoutHandle);

      resolve({
        stdout,
        stderr,
        exitCode,
        timedOut,
      });
    };

    dockerProcess.stdout.setEncoding('utf8');
    dockerProcess.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });

    dockerProcess.stderr.setEncoding('utf8');
    dockerProcess.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });

    dockerProcess.on('error', (error) => {
      stderr = error.message;
      finish(1);
    });

    dockerProcess.on('close', (code) => {
      if (!resolved) {
        finish(code ?? 1);
      }
    });

    timeoutHandle = setTimeout(() => {
      dockerProcess.kill('SIGKILL');
      finish(124, true);
    }, timeLimitMs);
  });
}
