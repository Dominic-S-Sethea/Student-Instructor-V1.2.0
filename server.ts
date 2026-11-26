import { loadConfig } from './server/config';
import { closeDatabase } from './server/db/connection';
import { runMigrations } from './server/db/migrate';
import { createApp } from './server/app';
import { getJwtSecret } from './server/services/authService';

async function startServer(): Promise<void> {
  const config = loadConfig();

  if (config.isProduction || config.isStaging) {
    try {
      getJwtSecret();
    } catch (err: unknown) {
      console.error(
        `[FATAL][SECURITY] Invalid JWT_SECRET in ${config.nodeEnv}:`,
        err instanceof Error ? err.message : err
      );
      process.exit(1);
    }
  }

  try {
    const result = runMigrations({
      seedCatalog: true,
      seedDemo: !config.isProduction && !config.isStaging ? config.seedDemoData || undefined : false,
    });
    console.log(
      `CDES Database initialized and migrations verified (schema v${result.schemaVersion}, env=${config.nodeEnv}).`
    );
  } catch (err: unknown) {
    console.error('Fatal database migration error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const isStaticMode = config.isProduction || config.isStaging;
  const app = createApp({
    frontendOrigin: config.frontendOrigin,
    serveStatic: isStaticMode,
    publicDistDir: config.publicDistDir,
  });

  let viteServer: { close: () => Promise<void> } | null = null;
  if (!isStaticMode) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    viteServer = vite;
    app.use(vite.middlewares);
  }

  const httpServer = app.listen(config.port, config.host, () => {
    console.log(`CDES Platform Server running on http://${config.host}:${config.port}`);
  });
  httpServer.requestTimeout = 45_000;
  httpServer.keepAliveTimeout = 65_000;
  httpServer.headersTimeout = 66_000;

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}; shutting down CDES Platform Server...`);
    const forceTimer = setTimeout(() => {
      try {
        closeDatabase();
      } catch {
        // ignore close error on forced exit
      }
      process.exit(1);
    }, 10_000);
    forceTimer.unref();

    httpServer.closeIdleConnections?.();
    httpServer.close(async () => {
      clearTimeout(forceTimer);
      try {
        if (viteServer) {
          await viteServer.close();
        }
      } catch {
        // ignore vite close errors during teardown
      }
      try {
        closeDatabase();
      } catch {
        // ignore
      }
      process.exit(0);
    });
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
