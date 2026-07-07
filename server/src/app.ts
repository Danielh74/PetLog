import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

import authRoutes from './routes/authRoutes.ts';
import petRoutes from './routes/petRoutes.ts';
import reminderRoutes from './routes/reminderRoutes.ts';
import aiRoutes from './routes/aiRoutes.ts';
import errorHandler from './middleware/errorHandler.ts';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/ai', aiRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

export default app;
