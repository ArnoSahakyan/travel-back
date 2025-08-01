import express from 'express';
import {
    requestNewsletterSubscription,
    verifyNewsletterSubscription,
    unsubscribeNewsletter,
    checkSubscriptionStatus,
    getAllSubscribers,
} from '../controllers/newsletter.controller';
import {isAdmin, verifyToken} from "../middlewares/auth.middleware";
import {asHandler} from "../utils";

const router = express.Router();

router.post('/subscribe', requestNewsletterSubscription);
router.get('/verify', verifyNewsletterSubscription);
router.post('/unsubscribe', verifyToken, asHandler(unsubscribeNewsletter));
router.get('/is-subscribed', verifyToken, checkSubscriptionStatus);
router.get('/all', verifyToken, isAdmin, getAllSubscribers);

export default router;
