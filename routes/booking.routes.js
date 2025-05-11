import express from 'express';
import {cancelBooking, createBooking, getAllBookings, getUsersBookings} from "../controllers/booking.controller.js";
import {isAdmin, verifyToken} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get('/', verifyToken, isAdmin, getAllBookings);
router.post('/', verifyToken, createBooking);
router.get('/my', verifyToken, getUsersBookings);
router.delete('/:booking_id', verifyToken, cancelBooking);

export default router;
