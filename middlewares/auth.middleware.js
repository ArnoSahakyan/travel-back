import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../models/index.js';

dotenv.config();

const {User} = db;

// Middleware to verify access token
export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({message: 'No token provided!'});
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({message: 'Unauthorized!'});
        }

        // Corrected this line: your token payload has user_id, not id
        req.userId = decoded.user_id;
        next();
    });
};

// Middleware to check if user is an admin
export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: {
                association: 'Role',
                attributes: ['role_name'],
            },
        });

        if (user?.Role?.role_name === 'admin') {
            return next();
        }

        return res.status(403).json({message: 'Admin access required.'});
    } catch (error) {
        console.error('isAdmin error:', error);
        return res.status(500).json({message: 'Internal server error.'});
    }
};
