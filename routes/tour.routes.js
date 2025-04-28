import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import {
    createTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour
} from '../controllers/tour.controller.js';
import {
    addImageToTour,
    getImagesForTour,
    deleteImageForTour
} from '../controllers/tourImage.controller.js';

const router = express.Router();

// Tour Routes
router.get('/tours', getAllTours);
router.get('/tours/:id', getTourById);
router.post('/tours', verifyToken, isAdmin, createTour);
router.put('/tours/:id', verifyToken, isAdmin, updateTour);
router.delete('/tours/:id', verifyToken, isAdmin, deleteTour);

// Tour Image Routes
router.post('/tours/:tourId/images', verifyToken, isAdmin, addImageToTour);
router.get('/tours/:tourId/images', getImagesForTour);
router.delete('/tours/:tourId/images/:imageId', verifyToken, isAdmin, deleteImageForTour);

export default router;
