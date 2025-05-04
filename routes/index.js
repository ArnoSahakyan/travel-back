import express from 'express';
import authRoutes from './auth.routes.js';
import destinationRoutes from './destinations.routes.js';
import tourRoutes from './tour.routes.js';
import tourCategoryRoutes from "./tourCategory.routes.js";

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/tours', tourRoutes);
router.use('/tourCategories', tourCategoryRoutes);

export default router;
