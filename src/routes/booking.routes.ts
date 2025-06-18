import express from 'express';
import {
    cancelBooking,
    createBooking,
    getAllBookings,
    getBookingById,
    getUsersBookings
} from "../controllers/booking.controller";
import {isAdmin, verifyToken} from "../middlewares/auth.middleware";
import {asHandler} from "../utils";

const router = express.Router();

router.get('/my', verifyToken, getUsersBookings);
router.get('/', verifyToken, isAdmin, getAllBookings);
router.get('/:booking_id', verifyToken, asHandler(getBookingById));
router.post('/', verifyToken, createBooking);
router.delete('/:booking_id', verifyToken, asHandler(cancelBooking));

export default router;
