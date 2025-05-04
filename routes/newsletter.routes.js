import express from 'express';
import {
    subscribeNewsletter,
    unsubscribeNewsletter,
    getAllSubscribers,
} from '../controllers/newsletter.controller.js';
import {verifyToken} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', verifyToken, unsubscribeNewsletter); // TODO: unsubscribe link in newsletter email
router.get('/', getAllSubscribers);

export default router;
