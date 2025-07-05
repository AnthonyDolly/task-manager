import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import taskRoutes from './routes/task';
import projectRoutes from './routes/project';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';
import { requestIdMiddleware } from './middlewares/requestId';
import logger from './utils/logger';
import compression from 'compression';

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(requestIdMiddleware);

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10)) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
});
app.use(limiter);
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(mongoSanitize());
app.use(xssClean());
app.use(compression());

// Replace morgan dev to winston stream
morgan.token('id', (req) => (req as any).requestId || '-');
const morganFormat = ':id :method :url :status :response-time ms';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      }
    }
  })
);

// Healthcheck route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// TODO: Aquí agregaremos rutas (usuarios, tareas, proyectos)
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/projects', projectRoutes);

// Error handler (debe ir al final)
app.use(errorHandler);

export default app; 