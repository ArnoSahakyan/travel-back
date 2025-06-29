import express from "express";
import {
    createPost,
    deletePost,
    getAllPosts,
    getPostBySlug,
    updatePost
} from "../controllers/post.controller";
import {isAdmin, verifyToken} from "../middlewares/auth.middleware";
import {upload} from "../middlewares/upload.middleware";
import {asHandler} from "../utils";

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:slug', getPostBySlug);
router.post('/', verifyToken, isAdmin, upload, createPost);
router.put('/:id', verifyToken, isAdmin, upload, asHandler(updatePost));
router.delete('/:id', verifyToken, isAdmin, asHandler(deletePost));

export default router;