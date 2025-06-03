import express from 'express';
import {verifyToken} from "../middlewares/auth.middleware";
import {
    addToWishlist,
    removeFromWishlist,
    getUserWishlists,
    checkWishlist
} from '../controllers/wishlist.controller.js';

const router = express.Router();

router.get('/', verifyToken, getUserWishlists);
router.post('/', verifyToken, addToWishlist);
router.get('/check/:tour_id', verifyToken, checkWishlist);
router.delete('/:tour_id', verifyToken, removeFromWishlist);

export default router;
