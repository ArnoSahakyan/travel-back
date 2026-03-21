import express from 'express';
import {sendMessage} from "../controllers/contact.controller";
import {asHandler} from "../utils";

const router = express.Router();

router.post('/', asHandler(sendMessage));

export default router;
