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
    addImagesToTour,
    getImagesForTour,
    deleteImageForTour,
    setCoverImage
} from '../controllers/tourImage.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Tour Routes
router.get('/', getAllTours);
router.get('/:id', getTourById);
router.post('/', verifyToken, isAdmin, upload, createTour);
router.put('/:id', verifyToken, isAdmin, updateTour);
router.delete('/:id', verifyToken, isAdmin, deleteTour);

// Tour Image Routes
router.post('/:tourId/images', verifyToken, isAdmin, upload, addImagesToTour);
router.get('/:tourId/images', getImagesForTour);
router.patch('/cover', verifyToken, isAdmin, setCoverImage);
router.delete('/:tourId/images/:imageId', verifyToken, isAdmin, deleteImageForTour);

export default router;
