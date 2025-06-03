import express from 'express';
import {
    requestNewsletterSubscription,
    verifyNewsletterSubscription,
    unsubscribeNewsletter,
    checkSubscriptionStatus,
    getAllSubscribers,
} from '../controllers/newsletter.controller.js';
import {isAdmin, verifyToken} from "../middlewares/auth.middleware";

const router = express.Router();

router.post('/subscribe', requestNewsletterSubscription);
router.get('/verify', verifyNewsletterSubscription);
router.get('/unsubscribe', unsubscribeNewsletter);
router.post('/unsubscribe', verifyToken, unsubscribeNewsletter);
router.get('/is-subscribed', verifyToken, checkSubscriptionStatus);
router.get('/all', isAdmin, getAllSubscribers);

export default router;
