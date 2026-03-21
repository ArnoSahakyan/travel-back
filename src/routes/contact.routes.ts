import express from 'express';
import {
    sendMessage,
    getAllMessages,
    getMessageById,
    updateMessageStatus,
    deleteMessage
} from "../controllers/contact.controller";
import {asHandler} from "../utils";
import {isAdmin, verifyToken} from "../middlewares/auth.middleware";

const router = express.Router();

router.post('/', asHandler(sendMessage));
router.get('/', verifyToken, isAdmin, asHandler(getAllMessages));
router.get('/:contact_id', verifyToken, isAdmin, asHandler(getMessageById));
router.put('/:contact_id/status', verifyToken, isAdmin, asHandler(updateMessageStatus));
router.delete('/:contact_id', verifyToken, isAdmin, asHandler(deleteMessage));

export default router;
