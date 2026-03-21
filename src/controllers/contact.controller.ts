import { Response } from 'express';
import { sendEmail, BadRequestError, NotFoundError } from '../utils';
import { IPaginationQuery, TypedRequest } from '../types';
import { generateContactMessageEmail } from "../emails";
import { Contact } from '../db/models';

interface ContactFormBody {
    full_name: string;
    email: string;
    phone_number: string;
    message: string;
}

interface UpdateStatusBody {
    status: 'unread' | 'read' | 'replied';
}

type ContactIdParam = {
    contact_id: number;
};

export const sendMessage = async (
    req: TypedRequest<{}, {}, ContactFormBody>,
    res: Response
) => {
    const { full_name, email, phone_number, message } = req.body;

    if (!full_name || !email || !phone_number || !message) {
        throw new BadRequestError('All fields are required.');
    }

    // Save to database
    await Contact.create({
        full_name,
        email,
        phone_number,
        message,
    });

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

export const getAllMessages = async (
    req: TypedRequest<{}, {}, {}, IPaginationQuery>,
    res: Response
): Promise<void> => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Contact.findAndCountAll({
        order: [['created_at', 'DESC']],
        limit,
        offset,
    });

    res.status(200).json({
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        messages: rows,
    });
};

export const getMessageById = async (
    req: TypedRequest<ContactIdParam>,
    res: Response
): Promise<void> => {
    const contact = await Contact.findByPk(req.params.contact_id);

    if (!contact) {
        throw new NotFoundError('Message not found');
    }

    res.status(200).json(contact);
};

export const updateMessageStatus = async (
    req: TypedRequest<ContactIdParam, {}, UpdateStatusBody>,
    res: Response
): Promise<void> => {
    const { status } = req.body;

    if (!['unread', 'read', 'replied'].includes(status)) {
        throw new BadRequestError('Invalid status');
    }

    const contact = await Contact.findByPk(req.params.contact_id);

    if (!contact) {
        throw new NotFoundError('Message not found');
    }

    contact.status = status;
    await contact.save();

    res.status(200).json(contact);
};

export const deleteMessage = async (
    req: TypedRequest<ContactIdParam>,
    res: Response
): Promise<void> => {
    const deleted = await Contact.destroy({ where: { contact_id: req.params.contact_id } });

    if (!deleted) {
        throw new NotFoundError('Message not found');
    }

    res.status(200).json({ message: 'Message deleted successfully' });
};
