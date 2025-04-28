import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/index.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Wanderluxe API ✈️' });
});

export default app;
