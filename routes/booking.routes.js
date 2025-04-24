import {
    createBooking,
    deleteBooking,
    getAllBookings,
    getBookingById,
    updateBooking
} from "../controllers/booking.controller.js";
import express from "express";

const router = express.Router();

// Get all bookings
router.get('/', getAllBookings);

// Get a specific booking by ID
router.get('/:id', getBookingById);

// Create a new booking
router.post('/', createBooking);

// Update an existing booking
router.put('/:id', updateBooking);

// Delete a booking
router.delete('/:id', deleteBooking);

export default router;
