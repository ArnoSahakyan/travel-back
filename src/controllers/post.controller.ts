import { Response } from 'express';
import {
    addSupabaseUrl,
    deleteFromSupabase,
    uploadAndProcessImages,
    generateUniqueSlug,
} from '../utils';
import { BLOGS_BUCKET } from '../constants';
import { Post } from '../db/models';
import {AuthenticatedRequest, IPaginationQuery} from '../types';
import {Op, WhereOptions} from "sequelize";

// --- Types for request bodies, params and queries ---
interface PostParams { id: string }
interface SlugParams { slug: string }
interface PostBody {
    title: string;
    slug?: string;
    excerpt: string;
    content: string;
    is_published: boolean;
}

interface GetFilteredTPostsQuery extends IPaginationQuery {
    search?: string;
}

// --- GET /posts?page=&limit= ---
export const getAllPosts = async (
    req: AuthenticatedRequest<{}, {}, {}, GetFilteredTPostsQuery>,
    res: Response
): Promise<void> => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        const baseCondition: WhereOptions = {};

        if (!req.user_role || req.user_role !== 'admin') {
            // guests & customers → only published
            baseCondition.is_published = true;
        }

        const searchCondition: WhereOptions | undefined = search
            ? {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { excerpt: { [Op.iLike]: `%${search}%` } },
                ],
            }
            : undefined;

        const whereCondition: WhereOptions = searchCondition
            ? {
                [Op.and]: [baseCondition, searchCondition],
            }
            : baseCondition;

        const { count, rows } = await Post.findAndCountAll({
            limit,
            offset,
            where: whereCondition,
            order: [['created_at', 'DESC']],
            attributes: { exclude: ['content'] },
        });

        const posts = rows.map((post) => {
            const raw = post.get({ plain: true });
            return {
                ...raw,
                image: raw.image ? addSupabaseUrl(raw.image, BLOGS_BUCKET) : null,
            };
        });

        res.json({
            total: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            posts,
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
};


// --- GET /posts/:slug ---
export const getPostBySlug = async (
    req: AuthenticatedRequest<SlugParams>,
    res: Response
): Promise<void> => {
    try {
        const whereCondition: WhereOptions = { slug: req.params.slug };

        if (!req.user_role || req.user_role !== 'admin') {
            whereCondition.is_published = true;
        }

        const post = await Post.findOne({ where: whereCondition });

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        const raw = post.get({ plain: true });

        res.json({
            ...raw,
            image: raw.image ? addSupabaseUrl(raw.image, BLOGS_BUCKET) : null,
        });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
};

// --- POST /posts ---
export const createPost = async (
    req: AuthenticatedRequest<{}, {}, PostBody>,
    res: Response
): Promise<void> => {
    const { title, slug, excerpt, content, is_published } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    try {
        let coverImagePath: string | undefined;
        const finalSlug = slug || (await generateUniqueSlug(title));

        if (files && files.length > 0) {
            const uploaded = await uploadAndProcessImages(files, BLOGS_BUCKET, finalSlug);
            coverImagePath = uploaded[0];
        }

        const newPost = await Post.create({
            title,
            slug: finalSlug,
            excerpt,
            content,
            image: coverImagePath,
            is_published,
        });

        res.status(201).json(newPost);
    } catch (error) {
        console.error('Create Blog Post Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// --- PUT /posts/:id ---
export const updatePost = async (
    req: AuthenticatedRequest<SlugParams, {}, Partial<PostBody>>,
    res: Response
): Promise<void> => {
    try {
        const { slug: initialSlug } = req.params;
        const { title, slug, excerpt, content, is_published } = req.body;
        const files = req.files as Express.Multer.File[] | undefined;

        const post = await Post.findOne({ where: { slug: initialSlug } });
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        let coverImagePath = post.image;

        if (files && files.length > 0) {
            if (coverImagePath) {
                await deleteFromSupabase(coverImagePath, BLOGS_BUCKET);
            }
            const newSlug = slug?.replace(/\s+/g, '_') || post.slug;
            const uploaded = await uploadAndProcessImages(files, BLOGS_BUCKET, newSlug);
            coverImagePath = uploaded[0];
        }

        await Post.update(
            {
                title,
                slug,
                excerpt,
                content,
                is_published,
                image: coverImagePath,
            },
            { where: { slug: initialSlug } }
        );

        const updatedPost = await Post.findOne({ where: { slug: initialSlug } });
        res.json(updatedPost);
    } catch (error) {
        console.error('Update Blog Post Error:', error);
        res.status(500).json({ error: 'Failed to update blog post' });
    }
};

// --- DELETE /posts/:id ---
export const deletePost = async (
    req: AuthenticatedRequest<PostParams>,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id);

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        if (post.image) {
            await deleteFromSupabase(post.image, BLOGS_BUCKET);
        }

        await Post.destroy({ where: { post_id: id } });

        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Delete Blog Post Error:', error);
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
};
