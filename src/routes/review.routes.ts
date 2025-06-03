import express from 'express';
import {createReview, deleteReview, getAllReviews, getReviewsForTour} from '../controllers/review.controller.js';
import {isAdmin, verifyToken} from "../middlewares/auth.middleware";

const router = express.Router();

router.get('/', getAllReviews);
router.post('/', verifyToken, createReview);
router.get('/tour/:tour_id', getReviewsForTour)
router.delete('/:review_id', verifyToken, isAdmin, deleteReview);

export default router;
