// tourRoutes.js
import express from 'express';
import { getAllTours, getTourById, createTour, updateTour, deleteTour } from '../controllers/tour.controller.js';

const router = express.Router();

// Get all tours
router.get('/', getAllTours);

// Get a specific tour by ID
router.get('/:id', getTourById);

// Create a new tour
router.post('/', createTour);

// Update an existing tour
router.put('/:id', updateTour);

// Delete a tour
router.delete('/:id', deleteTour);

export default router;
