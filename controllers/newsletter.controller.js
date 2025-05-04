import db from '../models/index.js';
const { NewsletterSubscriber } = db;

// Subscribe to the Newsletter (no login required)
export const subscribeNewsletter = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the email is already subscribed
        const existingSubscriber = await NewsletterSubscriber.findOne({ where: { email } });
        if (existingSubscriber) {
            return res.status(400).json({ message: 'This email is already subscribed.' });
        }

        // Create the new subscriber
        const subscriber = await NewsletterSubscriber.create({ email });
        res.status(201).json({ message: 'Subscription successful!', subscriber });
    } catch (error) {
        console.error('Subscribe Newsletter Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Unsubscribe from the Newsletter (if the user is logged in, they can unsubscribe their account)
export const unsubscribeNewsletter = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

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

// Get all subscribers (Admin only)
export const getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await NewsletterSubscriber.findAll();
        res.json(subscribers);
    } catch (error) {
        console.error('Get All Subscribers Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
