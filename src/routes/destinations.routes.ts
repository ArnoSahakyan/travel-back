import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/auth.middleware';
import {
    createDestination,
    getAllDestinations,
    getDestinationById,
    updateDestination,
    deleteDestination,
} from '../controllers/destinations.controller';
import {upload} from "../middlewares/upload.middleware";
import {asHandler} from "../utils";

const router = express.Router();

router.get('/', asHandler(getAllDestinations));
router.get('/:id', asHandler(getDestinationById));
router.post('/', verifyToken, isAdmin, upload, asHandler(createDestination));
router.put('/:id', verifyToken, isAdmin, upload, asHandler(updateDestination));
router.delete('/:id', verifyToken, isAdmin, asHandler(deleteDestination));

export default router;
