import { Router } from 'express';
import {
    signup,
    signin,
    refreshToken,
    userInfo
} from '../controllers/auth.controller.js';

import { verifyToken } from '../middlewares/authJwt.js';

const router = Router();

// @route   POST /api/auth/signup
router.post('/signup', signup);

// @route   POST /api/auth/signin
router.post('/signin', signin);

// @route   POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// @route   GET /api/auth/user-info (requires token)
router.get('/user-info', verifyToken, userInfo);

export default router;
