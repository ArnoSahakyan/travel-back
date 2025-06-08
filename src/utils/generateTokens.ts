import {User} from "../db/models";
import jwt from "jsonwebtoken";
import {ACCESS_KEY_DURATION, REFRESH_KEY_DURATION} from "../constants";

export const generateToken = (user: User): string => {
    return jwt.sign(
        {
            user_id: user.user_id,
            role: user.Role?.name || 'customer',
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: ACCESS_KEY_DURATION }
    );
};

export const generateRefreshToken = (user: User): string => {
    return jwt.sign(
        {
            user_id: user.user_id,
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: REFRESH_KEY_DURATION }
    );
};