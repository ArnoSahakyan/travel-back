import db from "../models/index.js";
import {addSupabaseUrl, deleteFromSupabase, uploadAndProcessImages} from "../utils/index.js";
import {BLOGS_BUCKET} from "../constants/index.js";
import {generateUniqueSlug} from "../utils/generateSlug.js";

const {BlogPost} = db;

export const getAllBlogPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await BlogPost.findAndCountAll({
            limit,
            offset,
            where: { is_published: true },
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['content'] }
        });

        const posts = rows.map(post => {
            const raw = post.get({ plain: true });
            return {
                ...raw,
                image: raw.image ? addSupabaseUrl(raw.image, BLOGS_BUCKET) : null
            };
        });

        res.json({
            total: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            posts
        });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
};

export const getBlogPostBySlug = async (req, res) => {
    try {
        const post = await BlogPost.findOne({
            where: { slug: req.params.slug, is_published: true }
        });

        if (!post) return res.status(404).json({ error: 'Post not found' });

        const raw = post.get({ plain: true });

        res.json({
            ...raw,
            image: raw.image ? addSupabaseUrl(raw.image, BLOGS_BUCKET) : null
        });
    } catch (error) {
        console.error("Error fetching blog post:", error);
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
};

export const createBlogPost = async (req, res) => {
    const {
        title,
        slug,
        excerpt,
        content,
        is_published
    } = req.body;

    const file = req.files;

    try {
        let coverImagePath = null;

        // Generate slug if it's missing
        const finalSlug = slug || await generateUniqueSlug(title);

        if (file) {
            const uploaded = await uploadAndProcessImages(file, BLOGS_BUCKET, finalSlug);
            coverImagePath = uploaded[0];
        }

        const newPost = await BlogPost.create({
            title,
            slug: finalSlug,
            excerpt,
            content,
            image: coverImagePath,
            is_published
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error('Create Blog Post Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateBlogPost = async (req, res) => {
    try {
        const {id} = req.params;
        const {
            title,
            slug,
            excerpt,
            content,
            is_published
        } = req.body;
        const file = req.files;

        const post = await BlogPost.findByPk(id);
        if (!post) return res.status(404).json({error: 'Post not found'});

        let coverImagePath = post.image;

        // Replace cover image if new image is uploaded
        if (file) {
            if (coverImagePath) {
                await deleteFromSupabase(coverImagePath, BLOGS_BUCKET);
            }
            const uploaded = await uploadAndProcessImages(file, BLOGS_BUCKET, slug.replace(/\s+/g, '_'));
            coverImagePath = uploaded[0];
        }

        await BlogPost.update(
            {
                title,
                slug,
                excerpt,
                content,
                is_published,
                image: coverImagePath
            },
            {where: {post_id: id}}
        );

        const updatedPost = await BlogPost.findByPk(id);
        res.json(updatedPost);
    } catch (error) {
        console.error('Update Blog Post Error:', error);
        res.status(500).json({error: 'Failed to update blog post'});
    }
};


export const deleteBlogPost = async (req, res) => {
    try {
        const {id} = req.params;
        const post = await BlogPost.destroy({
            where: {post_id: id}
        });

        if (!post) return res.status(404).json({error: 'Post not found'});

        if (post.image) {
            await deleteFromSupabase(post.image, BLOGS_BUCKET);
        }

        res.json({message: 'Post deleted'});
    } catch (error) {
        res.status(500).json({error: 'Failed to delete blog post'});
    }
};
