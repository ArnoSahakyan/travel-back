import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import {
    createDestination,
    getAllDestinations,
    getDestinationById,
    updateDestination,
    deleteDestination,
} from '../controllers/destinations.controller.js';
import {upload} from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);
router.post('/', verifyToken, isAdmin, upload, createDestination);
router.put('/:id', verifyToken, isAdmin, upload, updateDestination);
router.delete('/:id', verifyToken, isAdmin, deleteDestination);

export default router;
