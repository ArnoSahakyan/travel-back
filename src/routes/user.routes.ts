import express from 'express';
import { updatePersonalInfo, changePassword } from '../controllers/user.controller';
import {verifyToken} from "../middlewares/auth.middleware";

const router = express.Router();

router.put('/info', verifyToken, updatePersonalInfo);
router.put('/password', verifyToken, changePassword);

export default router;
