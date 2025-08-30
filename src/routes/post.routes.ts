import express from "express";
import {
    createPost,
    deletePost,
    getAllPosts,
    getPostBySlug,
    updatePost
} from "../controllers/post.controller";
import {isAdmin, optionalAuth, verifyToken} from "../middlewares/auth.middleware";
import {upload} from "../middlewares/upload.middleware";
import {asHandler} from "../utils";

const router = express.Router();

router.get('/', optionalAuth, getAllPosts);
router.get('/:slug', optionalAuth, asHandler(getPostBySlug));

router.post('/', verifyToken, isAdmin, upload, createPost);
router.put('/:slug', verifyToken, isAdmin, upload, asHandler(updatePost));
router.delete('/:id', verifyToken, isAdmin, asHandler(deletePost));

export default router;