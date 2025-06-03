import {User} from "../db/models";
import jwt from "jsonwebtoken";

export const generateToken = (user: User): string => {
    return jwt.sign(
        {
            user_id: user.user_id,
            role: user.Role?.name || 'customer',
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: '1h' }
    );
};

export const generateRefreshToken = (user: User): string => {
    return jwt.sign(
        {
            user_id: user.user_id,
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: '1d' }
    );
};