import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { User, Role } from '../db/models';
import { generateRefreshToken, generateToken, sendEmail, BadRequestError, NotFoundError, UnauthorizedError, AppError } from '../utils';
import { AuthenticatedRequest, TypedRequest } from '../types';
import { v4 as uuidv4 } from "uuid";
import { generateResetPasswordEmail } from "../emails";
import { EXPIRATION_TIME } from "../constants";

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
        throw new BadRequestError('Name, email, and password are required.');
    }

    const existingUser = await User.findOne({ where: { email }, paranoid: false });
    if (existingUser) {
        throw new AppError(409, 'Email already in use.');
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
};

// POST /auth/signin
export const signIn = async (req: TypedRequest<{}, {}, SignInBody>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError('Email and password are required.');
    }

    const user = await User.findOne({
        where: { email },
        include: { model: Role, as: 'Role' },
    });

    if (!user) {
        throw new UnauthorizedError('Invalid credentials.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new UnauthorizedError('Invalid credentials.');
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
};

// POST /auth/refresh-token
export const refreshToken = async (
    req: TypedRequest<{}, {}, RefreshTokenBody>,
    res: Response
) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        throw new BadRequestError('Refresh token is required.');
    }

    const decoded = jwt.verify(
        token,
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
        throw new UnauthorizedError('User not found.');
    }

    const newAccessToken = generateToken(user);

    res.json({
        token: newAccessToken,
    });
};

// GET /auth/user-info
export const userInfo = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const user_id = req.user_id;

    if (!user_id) {
        throw new UnauthorizedError('Unauthorized.');
    }

    const user = await User.findByPk(user_id, {
        include: {
            model: Role,
            as: 'Role',
            attributes: ['name'],
        },
    });

    if (!user) {
        throw new NotFoundError('User not found.');
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
};

export const requestPasswordReset = async (
    req: TypedRequest<{}, {}, EmailBody>,
    res: Response
) => {
    const { email } = req.body;

    if (!email) {
        throw new BadRequestError('Email is required.');
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new NotFoundError('User not found.');
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
};

export const resetPassword = async (
    req: TypedRequest<{}, {}, ResetPasswordBody, ResetPasswordQuery>,
    res: Response
): Promise<void> => {
    const { token } = req.query;
    const { new_password } = req.body;

    if (!token) {
        throw new BadRequestError('Reset token is required.');
    }

    if (!new_password) {
        throw new BadRequestError('New password is required.');
    }

    const user = await User.findOne({ where: { reset_password_token: token } });

    if (
        !user ||
        !user.reset_token_expires ||
        new Date() > user.reset_token_expires
    ) {
        throw new BadRequestError('Invalid or expired reset token.');
    }

    user.password = await bcrypt.hash(new_password, 10);
    user.reset_password_token = null;
    user.reset_token_expires = null;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
};
