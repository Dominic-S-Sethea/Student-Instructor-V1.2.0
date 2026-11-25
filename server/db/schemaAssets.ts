import fs from 'node:fs';
import path from 'node:path';

/** Resolve the directory containing schema.sql and migrations/ across source and dist layouts. */
export function resolveDbAssetsDir(overrideDir?: string): string {
  const candidates: string[] = [];
  if (overrideDir) {
    candidates.push(path.resolve(overrideDir));
  }
  if (process.env.DB_ASSETS_DIR) {
    candidates.push(path.resolve(process.env.DB_ASSETS_DIR));
  }
  if (typeof __dirname === 'string') {
    candidates.push(path.resolve(__dirname, 'db'));
    candidates.push(path.resolve(__dirname));
  }
  candidates.push(path.resolve(process.cwd(), 'server', 'db'));
  candidates.push(path.resolve(process.cwd(), 'dist', 'server', 'db'));

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'schema.sql'))) {
      return dir;
    }
  }

  throw new Error(
    `Database schema assets (schema.sql) could not be located. Checked: ${candidates.join(', ')}`
  );
}

/** Resolve schema.sql path. */
export function resolveSchemaPath(overrideDir?: string): string {
  return path.join(resolveDbAssetsDir(overrideDir), 'schema.sql');
}

/** Resolve migrations directory path. */
export function resolveMigrationsDir(overrideDir?: string): string {
  const envDir = process.env.MIGRATIONS_DIR;
  if (overrideDir) {
    return path.resolve(overrideDir);
  }
  if (envDir) {
    return path.resolve(envDir);
  }
  return path.join(resolveDbAssetsDir(), 'migrations');
}

/** Resolve public frontend dist directory without exposing server bundles. */
export function resolvePublicDistDir(overrideDir?: string): string {
  const candidates: string[] = [];
  if (overrideDir) {
    candidates.push(path.resolve(overrideDir));
  }
  if (process.env.PUBLIC_DIST_DIR) {
    candidates.push(path.resolve(process.env.PUBLIC_DIST_DIR));
  }
  if (typeof __dirname === 'string') {
    candidates.push(path.resolve(__dirname, '..', 'public'));
    candidates.push(path.resolve(__dirname, 'public'));
  }
  candidates.push(path.resolve(process.cwd(), 'dist', 'public'));

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'index.html'))) {
      return dir;
    }
  }

  return candidates[candidates.length - 1];
}
