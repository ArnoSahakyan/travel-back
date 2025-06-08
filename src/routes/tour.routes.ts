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
import { asHandler } from '../utils';

const router = express.Router();

// Tour Routes
router.get('/', getFilteredTours);
router.get('/:id', asHandler(getTourById));
router.post('/', verifyToken, isAdmin, upload, createTour);
router.put('/:id', verifyToken, isAdmin, asHandler(updateTour));
router.delete('/:id', verifyToken, isAdmin, asHandler(deleteTour));

// Tour Image Routes
router.post('/:tour_id/images', verifyToken, isAdmin, upload, asHandler(addImagesToTour));
router.get('/:tour_id/images', asHandler(getImagesForTour));
router.patch('/cover', verifyToken, isAdmin, setCoverImage);
router.delete('/:tour_id/images/:image_id', verifyToken, isAdmin, asHandler(deleteImageForTour));

export default router;
