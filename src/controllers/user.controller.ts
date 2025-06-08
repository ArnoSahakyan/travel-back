import { Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest } from '../types';
import { User } from '../db/models';

// Type for updating personal info
interface UpdatePersonalInfoBody {
    full_name: string;
    email: string;
    phone_number?: string;
}

// Type for password change body
interface ChangePasswordBody {
    current_password: string;
    new_password: string;
}

// Update Personal Information (Authenticated)
export const updatePersonalInfo = async (
    req: AuthenticatedRequest<{}, {}, UpdatePersonalInfoBody>,
    res: Response
): Promise<void> => {
    const { full_name, email, phone_number } = req.body;
    const user_id = req.user_id;

    try {
        const user = await User.findByPk(user_id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.full_name = full_name;
        user.email = email;
        if(phone_number) {
            user.phone_number = phone_number;
        }

        await user.save();

        res.json({
            message: 'Personal information updated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating personal info:', error);
        res.status(500).json({ message: 'Failed to update personal info' });
    }
};

// Change Password (Authenticated)
export const changePassword = async (
    req: AuthenticatedRequest<{}, {}, ChangePasswordBody>,
    res: Response
): Promise<void> => {
    const { current_password, new_password } = req.body;
    const user_id = req.user_id;

    try {
        const user = await User.findByPk(user_id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Incorrect current password' });
            return;
        }

        user.password = await bcrypt.hash(new_password, 10);
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
};
