import {
  runOrderedMigrations,
  MigrationRunOptions,
  MigrationRunResult,
} from './migrationRunner';

export type { MigrationRunOptions, MigrationRunResult };

/**
 * Unified startup migration entrypoint.
 * Applies base schema, ordered transactional SQL migrations, integrity/FK verification,
 * and explicit catalog/demo seeding.
 */
export function runMigrations(options: MigrationRunOptions = {}): MigrationRunResult {
  return runOrderedMigrations(options);
}
