import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import {
    createDestination,
    getAllDestinations,
    getDestinationById,
    updateDestination,
    deleteDestination,
} from '../controllers/destinations.controller.js';
import {upload} from "../middlewares/upload.middleware";

const router = express.Router();

router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);
router.post('/', verifyToken, isAdmin, upload, createDestination);
router.put('/:id', verifyToken, isAdmin, upload, updateDestination);
router.delete('/:id', verifyToken, isAdmin, deleteDestination);

export default router;
