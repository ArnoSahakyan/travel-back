import { Response } from 'express';
import { sendEmail, BadRequestError } from '../utils';
import { TypedRequest } from '../types';
import { generateContactMessageEmail } from "../emails";

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
        throw new BadRequestError('All fields are required.');
    }

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
};
