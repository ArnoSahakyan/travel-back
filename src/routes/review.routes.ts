import express from 'express';
import {createReview, deleteReview, getAllReviews, getReviewsForTour} from '../controllers/review.controller';
import {isAdmin, verifyToken} from "../middlewares/auth.middleware";
import {asHandler} from "../utils";

const router = express.Router();

router.get('/', asHandler(getAllReviews));
router.post('/', verifyToken, asHandler(createReview));
router.get('/tour/:tour_id', asHandler(getReviewsForTour))
router.delete('/:review_id', verifyToken, isAdmin, asHandler(deleteReview));

export default router;
