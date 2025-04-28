import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import {
    createDestination,
    getAllDestinations,
    getDestinationById,
    updateDestination,
    deleteDestination,
} from '../controllers/destinations.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllDestinations);
router.get('/:id', getDestinationById);

// Admin-only routes
router.post('/', verifyToken, isAdmin, createDestination);
router.put('/:id', verifyToken, isAdmin, updateDestination);
router.delete('/:id', verifyToken, isAdmin, deleteDestination);

export default router;
