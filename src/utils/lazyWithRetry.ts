const CHUNK_RELOAD_KEY = 'cdes_chunk_reload_at';
const RELOAD_COOLDOWN_MS = 15_000;

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const message = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : '';
  return (
    name === 'ChunkLoadError' ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /Loading chunk [\d\w-]+ failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

/**
 * Wraps a dynamic import() with automatic one-shot page reload recovery when a
 * stale cached index.html requests a hashed chunk replaced by a newer deploy.
 */
export async function importWithRetry<M>(importer: () => Promise<M>): Promise<M> {
  try {
    return await importer();
  } catch (firstErr) {
    if (typeof window !== 'undefined' && isChunkLoadError(firstErr)) {
      try {
        const lastReload = Number(window.sessionStorage.getItem(CHUNK_RELOAD_KEY) || '0');
        if (!lastReload || Date.now() - lastReload > RELOAD_COOLDOWN_MS) {
          window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
          window.location.reload();
          return await new Promise<M>(() => {});
        }
      } catch {
        // Ignore storage restrictions and let ErrorBoundary show recovery UI
      }
    }
    throw firstErr;
  }
}
