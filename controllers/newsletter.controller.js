import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';
import {sendEmail} from "../utils/index.js";
import {generateNewsletterConfirmationEmail} from "../emails/newsletterConfirmationEmail.js";

const { NewsletterSubscriber, NewsletterVerification, User } = db;

export const requestNewsletterSubscription = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        const existingSubscriber = await NewsletterSubscriber.findOne({ where: { email } });
        if (existingSubscriber) {
            return res.status(400).json({ message: 'This email is already subscribed.' });
        }

        const existingVerification = await NewsletterVerification.findOne({ where: { email } });
        if (existingVerification) {
            await existingVerification.destroy();
        }

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

        await NewsletterVerification.create({
            email,
            token,
            expires_at: expiresAt,
        });

        await sendEmail({
            to: email,
            subject: 'Confirm your WanderLuxe newsletter subscription',
            html: generateNewsletterConfirmationEmail({ token, email }),
        });

        res.status(200).json({ message: 'Verification email sent.' });
    } catch (error) {
        console.error('Request Newsletter Subscription Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const verifyNewsletterSubscription = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token is required.' });
    }

    try {
        const verification = await NewsletterVerification.findOne({ where: { token } });

        if (!verification) {
            return res.status(404).json({ message: 'Invalid or expired token.' });
        }

        if (new Date() > verification.expires_at) {
            await verification.destroy();
            return res.status(400).json({ message: 'Token has expired.' });
        }

        await NewsletterSubscriber.create({ email: verification.email });
        await verification.destroy();

        res.status(200).json({ message: 'Subscription confirmed!' });
    } catch (error) {
        console.error('Verify Newsletter Subscription Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const unsubscribeNewsletter = async (req, res) => {
    try {
        let email;

        // 1. If user is logged in
        if (req.userId) {
            const user = await User.findByPk(req.userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            email = user.email;
        }

        // 2. If email is passed as a query parameter
        if (!email && req.query.email) {
            email = req.query.email;
        }

        if (!email) {
            return res.status(400).json({ message: 'Email is required to unsubscribe.' });
        }

        // 3. Find and delete subscriber
        const subscriber = await NewsletterSubscriber.findOne({ where: { email } });

        if (!subscriber) {
            return res.status(404).json({ message: 'Subscriber not found.' });
        }

        await subscriber.destroy();
        res.json({ message: 'Successfully unsubscribed.' });
    } catch (error) {
        console.error('Unsubscribe Newsletter Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const checkSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
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

export const getAllSubscribers = async (_req, res) => {
    try {
        const subscribers = await NewsletterSubscriber.findAll();
        res.json(subscribers);
    } catch (error) {
        console.error('Get All Subscribers Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
