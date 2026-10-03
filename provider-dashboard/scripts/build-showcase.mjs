// Builds ../car-showcase (Vite) into public/showcase so a single Next.js
// deployment serves both apps: dashboard at "/", car showcase at "/showcase".
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const showcase = resolve(root, '../car-showcase');
const out = resolve(root, 'public/showcase');

const run = (cmd) =>
  execSync(cmd, {
    cwd: showcase,
    stdio: 'inherit',
    env: { ...process.env, SHOWCASE_BASE: '/showcase/', SHOWCASE_OUT_DIR: out },
  });

if (!existsSync(showcase)) {
  console.warn('[build-showcase] ../car-showcase not found, skipping.');
  process.exit(0);
}
if (!existsSync(resolve(showcase, 'node_modules'))) run('npm ci --include=dev');
run('npx tsc -b');
run('npx vite build');
