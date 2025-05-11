import express from 'express';
import authRoutes from './auth.routes.js';
import destinationRoutes from './destinations.routes.js';
import tourRoutes from './tour.routes.js';
import tourCategoryRoutes from "./tourCategory.routes.js";
import newsletterRoutes from "./newsletter.routes.js";
import bookingRoutes from "./booking.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import userRoutes from "./user.routes.js";

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/account', userRoutes);
router.use('/booking', bookingRoutes);
router.use('/destinations', destinationRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/tours', tourRoutes);
router.use('/tourCategories', tourCategoryRoutes);
router.use('/wishlist', wishlistRoutes);

export default router;
