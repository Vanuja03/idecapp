import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import dailyJobRoutes from './routes/dailyJobRoutes';
import jobRoutes from './routes/jobRoutes';
import userRoutes from './routes/userRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import { logger } from './utils/logger';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  if (!env.isTest) {
    app.use(pinoHttp({ logger }));
  }

  app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' }, message: 'Healthy' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/daily-jobs', dailyJobRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
