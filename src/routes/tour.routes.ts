import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import {
    createTour,
    getFilteredTours,
    getTourById,
    updateTour,
    deleteTour
} from '../controllers/tour.controller';
import {
    addImagesToTour,
    getImagesForTour,
    deleteImageForTour,
    setCoverImage
} from '../controllers/tourImage.controller';
import { upload } from '../middlewares/upload.middleware';

const router = express.Router();

// Tour Routes
router.get('/', getFilteredTours);
router.get('/:id', getTourById);
router.post('/', verifyToken, isAdmin, upload, createTour);
router.put('/:id', verifyToken, isAdmin, updateTour);
router.delete('/:id', verifyToken, isAdmin, deleteTour);

// Tour Image Routes
router.post('/:tour_id/images', verifyToken, isAdmin, upload, addImagesToTour);
router.get('/:tour_id/images', getImagesForTour);
router.patch('/cover', verifyToken, isAdmin, setCoverImage);
router.delete('/:tour_id/images/:imageId', verifyToken, isAdmin, deleteImageForTour);

export default router;
