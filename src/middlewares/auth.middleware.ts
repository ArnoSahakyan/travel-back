import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { RequestHandler, Response, NextFunction } from 'express';
import { User } from '../db/models';
import { AuthenticatedRequest } from '../types';

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
    user_id: number;
}

export const verifyToken: RequestHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(403).json({ message: 'No token provided!' });
        return;
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
        if (err || typeof decoded !== 'object' || !('user_id' in decoded)) {
            res.status(401).json({ message: 'Unauthorized!' });
            return;
        }

        req.user_id = (decoded as CustomJwtPayload).user_id;
        next();
    });
};

export const isAdmin: RequestHandler = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findByPk(req.user_id, {
            include: {
                association: 'Role',
                attributes: ['name'],
            },
        });

        if (user?.Role?.name === 'admin') {
            next();
            return;
        }

        res.status(403).json({ message: 'Admin access required.' });
    } catch (error) {
        console.error('isAdmin error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
