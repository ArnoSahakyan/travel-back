import express from 'express';
import { updatePersonalInfo, changePassword } from '../controllers/user.controller.js';
import {verifyToken} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.put('/info', verifyToken, updatePersonalInfo);
router.put('/password', verifyToken, changePassword);

export default router;
