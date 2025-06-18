import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
    NewsletterSubscriber,
    NewsletterVerification,
    User,
} from '../db/models';
import { sendEmail } from '../utils';
import { generateNewsletterConfirmationEmail } from '../emails';
import { TypedRequest, AuthenticatedRequest } from '../types';
import {EXPIRATION_TIME} from "../constants";

// ───── Types ─────────────────────────────
type EmailBody = { email: string };
type TokenQuery = { token?: string };
type EmailQuery = { email?: string };

// ───── Request a newsletter subscription ─────
export const requestNewsletterSubscription = async (
    req: TypedRequest<{}, {}, EmailBody>,
    res: Response
) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: 'Email is required.' });
        return;
    }

    try {
        const existingSubscriber = await NewsletterSubscriber.findOne({
            where: { email },
        });

        if (existingSubscriber) {
            res.status(400).json({ message: 'This email is already subscribed.' });
            return;
        }

        const existingVerification = await NewsletterVerification.findOne({
            where: { email },
        });

        if (existingVerification) {
            await existingVerification.destroy();
        }

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + EXPIRATION_TIME);

        await NewsletterVerification.create({
            email,
            token,
            expires_at: expiresAt,
        });

        await sendEmail({
            to: email,
            subject: 'Confirm your WanderLuxe newsletter subscription',
            html: generateNewsletterConfirmationEmail({ token }),
        });

        res.status(200).json({ message: 'Verification email sent.' });
    } catch (error) {
        console.error('Request Newsletter Subscription Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// ───── Verify newsletter subscription ─────
export const verifyNewsletterSubscription = async (
    req: TypedRequest<{}, {}, {}, TokenQuery>,
    res: Response
) => {
    const { token } = req.query;

    if (!token) {
        res.status(400).json({ message: 'Token is required.' });
        return;
    }

    try {
        const verification = await NewsletterVerification.findOne({
            where: { token },
        });

        if (!verification) {
            res.status(404).json({ message: 'Invalid or expired token.' });
            return;
        }

        if (new Date() > verification.expires_at) {
            await verification.destroy();
            res.status(400).json({ message: 'Token has expired.' });
            return;
        }

        await NewsletterSubscriber.create({ email: verification.email });
        await verification.destroy();

        res.status(200).json({ message: 'Subscription confirmed!' });
    } catch (error) {
        console.error('Verify Newsletter Subscription Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// ───── Unsubscribe from newsletter ─────
export const unsubscribeNewsletter = async (
    req: AuthenticatedRequest<{}, {}, {}, EmailQuery>,
    res: Response
) => {
    try {
        let email: string | undefined;

        if (req.user_id) {
            const user = await User.findByPk(req.user_id);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            email = user.email;
        }

        if (!email && typeof req.query.email === 'string') {
            email = req.query.email;
        }

        if (!email) {
            res.status(400).json({ message: 'Email is required to unsubscribe.' });
            return;
        }

        const subscriber = await NewsletterSubscriber.findOne({
            where: { email },
        });

        if (!subscriber) {
            res.status(404).json({ message: 'Subscriber not found.' });
            return;
        }

        await subscriber.destroy();
        res.json({ message: 'Successfully unsubscribed.' });
    } catch (error) {
        console.error('Unsubscribe Newsletter Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// ───── Check if user is subscribed ─────
export const checkSubscriptionStatus = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const user_id = req.user_id;

        if (!user_id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await User.findByPk(user_id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const subscriber = await NewsletterSubscriber.findOne({
            where: { email: user.email },
        });

        res.json({ subscribed: !!subscriber });
    } catch (error) {
        console.error('Check Subscription Status Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ───── Admin: Get all subscribers ─────
export const getAllSubscribers = async (_req: TypedRequest, res: Response) => {
    try {
        const subscribers = await NewsletterSubscriber.findAll();
        res.json(subscribers);
    } catch (error) {
        console.error('Get All Subscribers Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
