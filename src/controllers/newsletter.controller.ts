import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
    NewsletterSubscriber,
    NewsletterVerification,
    User,
} from '../db/models';
import { sendEmail, BadRequestError, NotFoundError, UnauthorizedError } from '../utils';
import { generateNewsletterConfirmationEmail } from '../emails';
import { TypedRequest, AuthenticatedRequest, IPaginationQuery } from '../types';
import { EXPIRATION_TIME } from "../constants";

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
        throw new BadRequestError('Email is required.');
    }

    const existingSubscriber = await NewsletterSubscriber.findOne({
        where: { email },
    });

    if (existingSubscriber) {
        throw new BadRequestError('This email is already subscribed.');
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
};

// ───── Verify newsletter subscription ─────
export const verifyNewsletterSubscription = async (
    req: TypedRequest<{}, {}, {}, TokenQuery>,
    res: Response
) => {
    const { token } = req.query;

    if (!token) {
        throw new BadRequestError('Token is required.');
    }

    const verification = await NewsletterVerification.findOne({
        where: { token },
    });

    if (!verification) {
        throw new NotFoundError('Invalid or expired token.');
    }

    if (new Date() > verification.expires_at) {
        await verification.destroy();
        throw new BadRequestError('Token has expired.');
    }

    await NewsletterSubscriber.create({ email: verification.email });
    await verification.destroy();

    res.status(200).json({ message: 'Subscription confirmed!' });
};

// ───── Unsubscribe from newsletter ─────
export const unsubscribeNewsletter = async (
    req: AuthenticatedRequest<{}, {}, {}, EmailQuery>,
    res: Response
) => {
    const isAdmin = req.user_role === 'admin';
    const requestedEmail = typeof req.query.email === 'string' ? req.query.email : undefined;

    if (isAdmin && requestedEmail) {
        const subscriber = await NewsletterSubscriber.findOne({ where: { email: requestedEmail } });

        if (!subscriber) {
            throw new NotFoundError('Subscriber not found.');
        }

        await subscriber.destroy();
        return res.json({ message: `Successfully unsubscribed ${requestedEmail}.` });
    }

    if (req.user_id) {
        const user = await User.findByPk(req.user_id);
        if (!user) {
            throw new NotFoundError('User not found.');
        }

        const subscriber = await NewsletterSubscriber.findOne({ where: { email: user.email } });
        if (!subscriber) {
            throw new NotFoundError('Subscriber not found.');
        }

        await subscriber.destroy();
        return res.json({ message: 'Successfully unsubscribed.' });
    }

    throw new BadRequestError('Email is required or you must be authenticated.');
};

// ───── Check if user is subscribed ─────
export const checkSubscriptionStatus = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const user_id = req.user_id;

    if (!user_id) {
        throw new UnauthorizedError('Unauthorized');
    }

    const user = await User.findByPk(user_id);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const subscriber = await NewsletterSubscriber.findOne({
        where: { email: user.email },
    });

    res.json({ subscribed: !!subscriber });
};

// ───── Admin: Get all subscribers ─────
export const getAllSubscribers = async (req: TypedRequest<{}, {}, {}, IPaginationQuery>, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await NewsletterSubscriber.findAndCountAll({
        limit,
        offset,
        order: [['subscribed_at', 'DESC']],
    });

    res.json({
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        subscribers: rows,
    });
};
