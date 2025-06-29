import { Response } from 'express';
import { Op } from 'sequelize';
import { Destination, Tour, Post } from '../db/models';
import { addSupabaseUrl } from '../utils';
import { DESTINATIONS_BUCKET, TOURS_BUCKET, BLOGS_BUCKET } from '../constants';
import { TourImage } from "../db/models";
import { TypedRequest } from "../types";

interface GetFilteredTPostsQuery {
    limit: number;
    query: string;
}

export const globalSearch = async (req: TypedRequest<{}, {}, {}, GetFilteredTPostsQuery>, res: Response) => {
    const { query, limit } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required.' });
    }

    try {
        const [destinations, tours, posts] = await Promise.all([
            Destination.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${query}%` } },
                        { description: { [Op.iLike]: `%${query}%` } },
                    ],
                },
                limit,
            }),
            Tour.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${query}%` } },
                        { description: { [Op.iLike]: `%${query}%` } },
                    ],
                },
                limit,
                include: [
                    {
                        model: TourImage,
                        as: 'TourImages',
                        where: { is_cover: true },
                        required: false,
                        attributes: ['image_url'],
                    },
                ],
            }),
            Post.findAll({
                where: {
                    is_published: true,
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${query}%` } },
                        { excerpt: { [Op.iLike]: `%${query}%` } },
                    ],
                },
                limit,
                attributes: ['post_id', 'title', 'slug', 'excerpt', 'image'],
            }),
        ]);

        res.json({
            destinations: destinations.map((d) => ({
                id: d.destination_id,
                name: d.name,
                image: d.image ?  addSupabaseUrl(d.image, DESTINATIONS_BUCKET) : undefined,
                description: d.description,
                type: 'destination',
            })),
            tours: tours.map((t) => ({
                id: t.tour_id,
                name: t.name,
                image: t.TourImages?.[0]?.image_url
                    ? addSupabaseUrl(t.TourImages[0].image_url, TOURS_BUCKET)
                    : null,
                description: t.description,
                type: 'tour',
            })),
            posts: posts.map((p) => ({
                id: p.post_id,
                name: p.title,
                image: p.image ? addSupabaseUrl(p.image, BLOGS_BUCKET) : null,
                slug: p.slug,
                excerpt: p.excerpt,
                type: 'post',
            })),
        });
    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
