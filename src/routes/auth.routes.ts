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
import {asHandler} from "../utils";

const router = express.Router();

// Public routes
router.post('/signup', asHandler(signUp));
router.post('/signin', asHandler(signIn));
router.post('/refresh', asHandler(refreshToken));
router.post('/request-password-reset', asHandler(requestPasswordReset));
router.post('/reset-password', asHandler(resetPassword));

// Protected route
router.get('/me', verifyToken, asHandler(userInfo));

export default router;
