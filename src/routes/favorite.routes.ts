import express from 'express';
import {verifyToken} from "../middlewares/auth.middleware";
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
router.get('/check/:tour_id', asHandler(checkFavorite));
router.delete('/:tour_id', verifyToken, asHandler(removeFromFavorites));

export default router;
