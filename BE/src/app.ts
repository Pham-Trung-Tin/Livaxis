import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import { env } from './config/env';
import { configurePassport } from './config/passport';
import { authRouter } from './routes/auth.routes';
import { productRouter } from './routes/product.routes';
import { aiRoomPlannerRouter } from './routes/aiRoomPlanner.routes';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();
configurePassport();

app.use(
	cors({
		origin: env.CORS_ORIGINS,
		credentials: true,
	}),
);
app.use(express.json({ limit: '30mb' }));
app.use(cookieParser());
app.use(passport.initialize());

app.get('/health', (_req: Request, res: Response) => {
	res.status(200).json({ success: true, message: 'Backend is healthy' });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/ai-room-planner', aiRoomPlannerRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
