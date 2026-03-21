import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/category.controller';
import {isAdmin, verifyToken} from "../middlewares/auth.middleware";
import {asHandler} from "../utils";

const router = express.Router();

router.post('/', verifyToken, isAdmin, asHandler(createCategory));
router.get('/', verifyToken, isAdmin, asHandler(getAllCategories));
router.get('/:id', asHandler(getCategoryById));
router.put('/:id', verifyToken, isAdmin, asHandler(updateCategory));
router.delete('/:id', verifyToken, isAdmin, asHandler(deleteCategory));

export default router;
