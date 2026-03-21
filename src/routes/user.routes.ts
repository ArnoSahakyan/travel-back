import express from 'express';
import { updatePersonalInfo, changePassword, getAllUsers, getUserById, updateUserRole, deleteUser, updateUserAdmin } from '../controllers/user.controller';
import {isAdmin, verifyToken} from "../middlewares/auth.middleware";
import {asHandler} from "../utils";

const router = express.Router();

router.put('/info', verifyToken, asHandler(updatePersonalInfo));
router.put('/password', verifyToken, asHandler(changePassword));

// Admin routes
router.get('/', verifyToken, isAdmin, asHandler(getAllUsers));
router.get('/:user_id', verifyToken, isAdmin, asHandler(getUserById));
router.patch('/:user_id/role', verifyToken, isAdmin, asHandler(updateUserRole));
router.put('/:user_id', verifyToken, isAdmin, asHandler(updateUserAdmin));
router.delete('/:user_id', verifyToken, isAdmin, asHandler(deleteUser));

export default router;
