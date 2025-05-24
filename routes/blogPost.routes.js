import express from "express";
import {
    createBlogPost,
    deleteBlogPost,
    getAllBlogPosts,
    getBlogPostBySlug,
    updateBlogPost
} from "../controllers/blogPost.controller.js";
import {isAdmin, verifyToken} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get('/', getAllBlogPosts);
router.get('/:slug', getBlogPostBySlug);
router.post('/', verifyToken, isAdmin, upload, createBlogPost);
router.put('/:id', verifyToken, isAdmin, upload, updateBlogPost);
router.delete('/:id', verifyToken, isAdmin, deleteBlogPost);

export default router;