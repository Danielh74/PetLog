import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';

import authRoutes from './routes/authRoutes.ts';
import petRoutes from './routes/petRoutes.ts';
import reminderRoutes from './routes/reminderRoutes.ts';
import errorHandler from './middleware/errorHandler.ts';
import openapiSpec from './docs/openapi.ts';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Swagger UI's inline styles/scripts need a relaxed CSP — scoped to this route only.
app.use('/api-docs', helmet({ contentSecurityPolicy: false }), swaggerUi.serve, swaggerUi.setup(openapiSpec));
app.get('/api-docs.json', (_req, res) => res.json(openapiSpec));

app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/reminders', reminderRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

export default app;
