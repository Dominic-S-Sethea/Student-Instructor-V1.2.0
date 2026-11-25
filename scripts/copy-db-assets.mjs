import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const srcDbDir = path.join(rootDir, 'server', 'db');
const destDbDir = path.join(rootDir, 'dist', 'server', 'db');
const destMigrationsDir = path.join(destDbDir, 'migrations');

fs.mkdirSync(destMigrationsDir, { recursive: true });
fs.copyFileSync(path.join(srcDbDir, 'schema.sql'), path.join(destDbDir, 'schema.sql'));

const srcMigrationsDir = path.join(srcDbDir, 'migrations');
for (const file of fs.readdirSync(srcMigrationsDir)) {
  if (file.endsWith('.sql')) {
    fs.copyFileSync(path.join(srcMigrationsDir, file), path.join(destMigrationsDir, file));
  }
}

console.log('Copied server SQL assets into dist/server/db.');
