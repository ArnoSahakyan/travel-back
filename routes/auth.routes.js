import express from 'express';
import {
    signup,
    signin,
    refreshToken,
    userInfo,
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js'; // assuming you'll have this middleware

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/refresh-token', refreshToken);

// Protected route
router.get('/me', verifyToken, userInfo);

export default router;
