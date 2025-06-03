import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User, Role } from '../db/models';
import {generateRefreshToken, generateToken} from "../utils";
import {AuthenticatedRequest} from "../types";

interface JwtPayload {
    user_id: number;
    role?: string;
}

export const signUp = async (req: Request, res: Response) => {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        const existingUser = await User.findOne({ where: { email }, paranoid: false });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            full_name,
            email,
            password: hashedPassword,
            phone_number: phone,
            role_id: 2,
        });

        res.status(201).json({ message: 'Registration successful.' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({
            where: { email },
            include: { model: Role, as: 'Role' },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
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

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;

        const user = await User.findByPk(decoded.user_id, {
            include: {
                model: Role,
                as: 'Role',
                attributes: ['name'],
            },
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
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

export const userInfo = async (req: AuthenticatedRequest, res: Response) => {
    const user_id = req.user_id;

    if (!user_id) {
        return res.status(401).json({ message: 'Unauthorized.' });
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
            return res.status(404).json({ message: 'User not found.' });
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
