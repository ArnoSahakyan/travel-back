import express from 'express';
import {
    cancelBooking,
    createBooking,
    getAllBookings,
    getBookingById,
    getUsersBookings,
    confirmBooking
} from "../controllers/booking.controller";
import {isAdmin, verifyToken} from "../middlewares/auth.middleware";
import {asHandler} from "../utils";

const router = express.Router();

router.get('/my', verifyToken, asHandler(getUsersBookings));
router.get('/', verifyToken, isAdmin, asHandler(getAllBookings));
router.get('/:booking_id', verifyToken, asHandler(getBookingById));
router.post('/', verifyToken, asHandler(createBooking));
router.delete('/:booking_id', verifyToken, asHandler(cancelBooking));
router.patch('/:booking_id/confirm', verifyToken, isAdmin, asHandler(confirmBooking));

export default router;
