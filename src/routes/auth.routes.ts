import express from 'express';
import {
    refreshToken,
    userInfo,
    signUp,
    signIn,
    requestPasswordReset,
    resetPassword,
} from '../controllers/auth.controller';
import {verifyToken} from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh', refreshToken);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Protected route
router.get('/me', verifyToken, userInfo);

export default router;
