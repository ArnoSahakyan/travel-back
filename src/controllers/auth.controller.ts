import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { User, Role } from '../db/models';
import {generateRefreshToken, generateToken, sendEmail} from '../utils';
import {AuthenticatedRequest, TypedRequest} from '../types';
import {v4 as uuidv4} from "uuid";
import {generateResetPasswordEmail} from "../emails";
import {EXPIRATION_TIME} from "../constants";

interface SignUpBody {
    full_name: string;
    email: string;
    password: string;
    phone_number?: string;
}

interface SignInBody {
    email: string;
    password: string;
}

interface RefreshTokenBody {
    refreshToken: string;
}

interface JwtPayload {
    user_id: number;
    role?: string;
}

interface EmailBody { email: string }

interface ResetPasswordBody {
    new_password: string;
}

interface ResetPasswordQuery {
    token?: string;
}

// POST /auth/signup
export const signUp = async (req: TypedRequest<{}, {}, SignUpBody>, res: Response) => {
    const { full_name, email, password, phone_number } = req.body;

    if (!full_name || !email || !password) {
        res.status(400).json({ message: 'Name, email, and password are required.' });
        return;
    }

    try {
        const existingUser = await User.findOne({ where: { email }, paranoid: false });
        if (existingUser) {
            res.status(409).json({ message: 'Email already in use.' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            full_name,
            email,
            password: hashedPassword,
            phone_number,
            role_id: 2, // Default user role
        });

        res.status(201).json({ message: 'Registration successful.' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /auth/signin
export const signIn = async (req: TypedRequest<{}, {}, SignInBody>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }

    try {
        const user = await User.findOne({
            where: { email },
            include: { model: Role, as: 'Role' },
        });

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            token,
            refreshToken,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.Role?.name,
            },
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// POST /auth/refresh-token
export const refreshToken = async (
    req: TypedRequest<{}, {}, RefreshTokenBody>,
    res: Response
) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required.' });
        return;
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as JwtPayload;

        const user = await User.findByPk(decoded.user_id, {
            include: {
                model: Role,
                as: 'Role',
                attributes: ['name'],
            },
        });

        if (!user) {
            res.status(401).json({ message: 'User not found.' });
            return;
        }

        const newAccessToken = generateToken(user);

        res.json({
            token: newAccessToken,
        });
    } catch (err) {
        console.error('Refresh Token Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// GET /auth/user-info
export const userInfo = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const user_id = req.user_id;

    if (!user_id) {
        res.status(401).json({ message: 'Unauthorized.' });
        return;
    }

    try {
        const user = await User.findByPk(user_id, {
            include: {
                model: Role,
                as: 'Role',
                attributes: ['name'],
            },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        res.json({
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone_number,
                role: user.Role?.name,
            },
        });
    } catch (err) {
        console.error('User Info Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const requestPasswordReset = async (
    req: TypedRequest<{}, {}, EmailBody>,
    res: Response
) => {
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ message: 'Email is required.' });
        return;
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        const token = uuidv4();
        const expiresAt = new Date(Date.now() + EXPIRATION_TIME);

        user.reset_password_token = token;
        user.reset_token_expires = expiresAt;
        await user.save();

        await sendEmail({
            to: email,
            subject: 'Reset Your Password',
            html: generateResetPasswordEmail({ token }),
        });

        res.status(200).json({ message: 'Reset email sent.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const resetPassword = async (
    req: TypedRequest<{}, {}, ResetPasswordBody, ResetPasswordQuery>,
    res: Response
): Promise<void> => {
    const { token } = req.query;
    const { new_password } = req.body;

    if (!token) {
        res.status(400).json({ message: 'Reset token is required.' });
        return;
    }

    if (!new_password) {
        res.status(400).json({ message: 'New password is required.' });
        return;
    }

    try {
        const user = await User.findOne({ where: { reset_password_token: token } });

        if (
            !user ||
            !user.reset_token_expires ||
            new Date() > user.reset_token_expires
        ) {
            res.status(400).json({ message: 'Invalid or expired reset token.' });
            return;
        }

        user.password = await bcrypt.hash(new_password, 10);
        user.reset_password_token = null;
        user.reset_token_expires = null;

        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
};
