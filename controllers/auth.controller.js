import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { User, Role } = db;

const generateToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            role: user.Role?.role_name || 'customer',
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

export const signup = async (req, res) => {
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
            role_id: 2, // default role: customer
        });

        res.status(201).json({ message: 'Registration successful.' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({
            where: { email },
            include: { model: Role, as: 'Role' }
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
                role: user.Role?.role_name,
            },
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findByPk(decoded.user_id, {
            include: {
                model: Role,
                as: 'Role',
                attributes: ['role_name'],
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        const newAccessToken = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);

        res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        console.error('Refresh Token Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const userInfo = async (req, res) => {
    const user_id = req.userId;

    try {
        const user = await User.findByPk(user_id, {
            include: {
                model: Role,
                as: 'Role',
                attributes: ['role_name'],
            }
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
                role: user.Role?.role_name,
            },
        });
    } catch (err) {
        console.error('User Info Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
