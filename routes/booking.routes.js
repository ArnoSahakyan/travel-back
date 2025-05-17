import express from 'express';
import {
    cancelBooking,
    createBooking,
    getAllBookings,
    getBookingById,
    getUsersBookings
} from "../controllers/booking.controller.js";
import {isAdmin, verifyToken} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get('/my', verifyToken, getUsersBookings);
router.get('/', verifyToken, isAdmin, getAllBookings);
router.get('/:booking_id', verifyToken, getBookingById);
router.post('/', verifyToken, createBooking);
router.delete('/:booking_id', verifyToken, cancelBooking);

export default router;
