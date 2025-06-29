import express from 'express';
import authRoutes from './auth.routes';
import bookingRoutes from "./booking.routes";
import categoryRoutes from "./category.routes";
import contactRoutes from "./contact.routes";
import destinationRoutes from './destinations.routes';
import favoriteRoutes from "./favorite.routes";
import newsletterRoutes from "./newsletter.routes";
import postRoutes from "./post.routes";
import reviewRoutes from "./review.routes";
import searchRoutes from "./search.routes";
import tourRoutes from './tour.routes';
import userRoutes from "./user.routes";

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/account', userRoutes);
router.use('/blog', postRoutes);
router.use('/booking', bookingRoutes);
router.use('/destinations', destinationRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/review', reviewRoutes);
router.use('/search', searchRoutes);
router.use('/tours', tourRoutes);
router.use('/categories', categoryRoutes);
router.use('/favorite', favoriteRoutes);
router.use('/contact', contactRoutes);

export default router;
