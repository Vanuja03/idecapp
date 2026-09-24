import { connectDatabase } from './config/db';
import { env } from './config/env';
import { createApp } from './app';
import { logger } from './utils/logger';

async function start() {
  await connectDatabase();
  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`API listening on port ${env.port} (${env.nodeEnv}) timezone=${env.appTimezone}`);
  });
}

start().catch((error) => {
  console.error('FAILED TO START SERVER:', error);
  process.exit(1);
});
