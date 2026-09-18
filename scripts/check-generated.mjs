import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const directory = await mkdtemp(join(tmpdir(), 'gaming-types-'));
try {
  const file = join(directory, 'schema.d.ts');
  execFileSync(
    process.execPath,
    ['node_modules/openapi-typescript/bin/cli.js', 'contracts/v1/openapi.json', '-o', file],
    { stdio: 'inherit' },
  );
  if (!(await readFile(file)).equals(await readFile('src/api/generated/schema.d.ts'))) {
    throw new Error('Generated API types drifted. Run npm run generate:types.');
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
