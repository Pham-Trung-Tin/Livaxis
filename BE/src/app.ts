import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import express, { Application, Request, Response } from 'express';

const app: Application = express();


export default app;
