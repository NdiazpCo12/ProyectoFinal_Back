import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export async function createSandboxDir(prefix = 'cpp-worker-') {
  const directory = join(tmpdir(), `${prefix}${randomUUID()}`);
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  return directory;
}

export async function removeSandboxDir(path: string) {
  await fs.rm(path, { recursive: true, force: true });
}
