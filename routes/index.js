import express from 'express';
import authRoutes from './auth.routes.js';
import destinationRoutes from './destinations.routes.js';
import tourRoutes from './tour.routes.js';
import tourCategoryRoutes from "./tourCategory.routes.js";
import newsletterRoutes from "./newsletter.routes.js";

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/tours', tourRoutes);
router.use('/tourCategories', tourCategoryRoutes);
router.use('/newsletter', newsletterRoutes);

export default router;
