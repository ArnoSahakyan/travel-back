import db from "../models/index.js";
import bcrypt from "bcrypt";

const { User } = db

export const updatePersonalInfo = async (req, res) => {
    const { full_name, email, phone } = req.body;
    const userId = req.userId;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.full_name = full_name;
        user.email = email;
        user.phone = phone || null;

        await user.save();

        return res.json({ message: 'Personal information updated successfully', user });
    } catch (error) {
        console.error('Error updating personal info:', error);
        return res.status(500).json({ message: 'Failed to update personal info' });
    }
};

export const changePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    const userId = req.userId;

    try {
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        user.password = await bcrypt.hash(new_password, 10);

        await user.save();

        return res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ message: 'Failed to change password' });
    }
};
