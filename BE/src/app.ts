import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/env';
import { apiRouter } from './routes';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

app.use(
	cors({
		origin: env.CORS_ORIGINS,
		credentials: true,
	}),
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({ success: true, message: 'Backend is healthy' });
});

app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
