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

router.post('/subscribe', asHandler(requestNewsletterSubscription));
router.get('/verify', asHandler(verifyNewsletterSubscription));
router.post('/unsubscribe', verifyToken, asHandler(unsubscribeNewsletter));
router.get('/is-subscribed', verifyToken, asHandler(checkSubscriptionStatus));
router.get('/all', verifyToken, isAdmin, asHandler(getAllSubscribers));

export default router;
