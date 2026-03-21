import express from 'express';
import { getAdminStats } from '../controllers/stats.controller';
import { isAdmin, verifyToken } from '../middlewares/auth.middleware';
import { asHandler } from '../utils';

const router = express.Router();

router.get('/', verifyToken, isAdmin, asHandler(getAdminStats));

export default router;
