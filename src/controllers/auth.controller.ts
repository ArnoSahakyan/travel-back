import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { User, Role } from '../db/models';
import { generateRefreshToken, generateToken } from '../utils';
import {AuthenticatedRequest, TypedRequest} from '../types';

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
