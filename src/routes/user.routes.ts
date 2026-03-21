import express from 'express';
import { updatePersonalInfo, changePassword } from '../controllers/user.controller';
import {verifyToken} from "../middlewares/auth.middleware";
import {asHandler} from "../utils";

const router = express.Router();

router.put('/info', verifyToken, asHandler(updatePersonalInfo));
router.put('/password', verifyToken, asHandler(changePassword));

export default router;
