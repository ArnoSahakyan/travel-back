import { Response } from 'express';
import { sendEmail } from '../utils';
import { TypedRequest } from '../types';
import {generateContactMessageEmail} from "../emails";

interface ContactFormBody {
    full_name: string;
    email: string;
    phone_number: string;
    message: string;
}

export const sendMessage = async (
    req: TypedRequest<{}, {}, ContactFormBody>,
    res: Response
) => {
    const { full_name, email, phone_number, message } = req.body;

    if (!full_name || !email || !phone_number || !message) {
        res.status(400).json({ message: 'All fields are required.' });
        return;
    }

    try {
        const html = generateContactMessageEmail({
            full_name,
            email,
            phone_number,
            message,
        });

        await sendEmail({
            to: 'sahakyan.arno@gmail.com',
            subject: 'New Customer Message',
            html,
        });

        res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ message: 'Failed to send message.' });
    }
};
