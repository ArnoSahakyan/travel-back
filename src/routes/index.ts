import express from 'express';
import authRoutes from './auth.routes';
import destinationRoutes from './destinations.routes';
import tourRoutes from './tour.routes';
import categoryRoutes from "./category.routes";
import newsletterRoutes from "./newsletter.routes";
import bookingRoutes from "./booking.routes";
import wishlistRoutes from "./wishlist.routes";
import userRoutes from "./user.routes";
import reviewRoutes from "./review.routes";
import postRoutes from "./post.routes";

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/account', userRoutes);
router.use('/blog', postRoutes);
router.use('/booking', bookingRoutes);
router.use('/destinations', destinationRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/review', reviewRoutes);
router.use('/tours', tourRoutes);
router.use('/categories', categoryRoutes);
router.use('/wishlist', wishlistRoutes);

export default router;
