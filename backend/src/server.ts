import 'dotenv/config';
import app from './app';
import { pool } from './config/database';
import { redis } from './config/redis';

const PORT = Number(process.env.PORT ?? 4000);

async function bootstrap(): Promise<void> {
  // Verify DB connection
  try {
    const client = await pool.connect();
    console.log('[DB] PostgreSQL connection established');
    client.release();
  } catch (err) {
    console.error('[DB] Failed to connect to PostgreSQL:', err);
    process.exit(1);
  }

  // Verify Redis connection
  try {
    await redis.ping();
    console.log('[REDIS] Redis connection established');
  } catch (err) {
    console.error('[REDIS] Failed to connect to Redis:', err);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(
      `[SERVER] Running in ${process.env.NODE_ENV ?? 'development'} mode on port ${PORT}`
    );
  });

  // ── Graceful Shutdown ────────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[SERVER] Received ${signal}. Shutting down gracefully…`);
    server.close(async () => {
      await pool.end();
      await redis.quit();
      console.log('[SERVER] Closed remaining connections. Exiting.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('[SERVER] Unhandled bootstrap error:', err);
  process.exit(1);
});
