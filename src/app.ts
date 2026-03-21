import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes';
import { globalErrorHandler } from './middlewares/errorHandler.middleware';

dotenv.config();

const corsOptions = {
    origin: process.env.CORS,
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: -1
};

const app: Application = express();

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to Wanderluxe API ✈️' });
});

app.use(globalErrorHandler);

export default app;
