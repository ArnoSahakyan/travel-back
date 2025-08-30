import express from 'express';
import {optionalAuth, verifyToken} from "../middlewares/auth.middleware";
import {
    addToFavorites,
    checkFavorite,
    getUserFavorites,
    removeFromFavorites
} from '../controllers/favorite.controller';
import {asHandler} from "../utils";

const router = express.Router();

router.get('/', verifyToken, getUserFavorites);
router.post('/', verifyToken, addToFavorites);
router.get('/check/:tour_id', optionalAuth, asHandler(checkFavorite));
router.delete('/:tour_id', verifyToken, asHandler(removeFromFavorites));

export default router;
