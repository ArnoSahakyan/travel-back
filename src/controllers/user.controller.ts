import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest } from '../types';
import { User } from '../db/models';
import { NotFoundError, BadRequestError } from '../utils';

interface UpdatePersonalInfoBody {
    full_name: string;
    email: string;
    phone_number?: string;
}

interface ChangePasswordBody {
    current_password: string;
    new_password: string;
}

export const updatePersonalInfo = async (
    req: AuthenticatedRequest<{}, {}, UpdatePersonalInfoBody>,
    res: Response
): Promise<void> => {
    const { full_name, email, phone_number } = req.body;
    const user_id = req.user_id;

    const user = await User.findByPk(user_id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    user.full_name = full_name;
    user.email = email;

    if (req.body.hasOwnProperty('phone_number')) {
        user.phone_number = phone_number ? phone_number : null;
    }

    await user.save();

    res.json({
        message: 'Personal information updated successfully',
        user
    });
};

export const changePassword = async (
    req: AuthenticatedRequest<{}, {}, ChangePasswordBody>,
    res: Response
): Promise<void> => {
    const { current_password, new_password } = req.body;
    const user_id = req.user_id;

    const user = await User.findByPk(user_id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
        throw new BadRequestError('Incorrect current password');
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
};
