import express from 'express';
import {
    refreshToken,
    userInfo,
    signUp,
    signIn,
} from '../controllers/auth.controller';
import {verifyToken} from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh', refreshToken);

// Protected route
router.get('/me', verifyToken, userInfo);

export default router;
