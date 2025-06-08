import { Response } from 'express';
import { Favorite, Tour, TourImage } from '../db/models';
import { TOURS_BUCKET } from '../constants';
import { addSupabaseUrl } from '../utils';
import {AuthenticatedRequest, IPaginationQuery} from '../types';

// --- Types ---
type TourIdParams = { tour_id: number };

// --- Add a tour to user's favorites ---
export const addToFavorites = async (
    req: AuthenticatedRequest<{}, any, TourIdParams>,
    res: Response
): Promise<void> => {
    try {
        const user_id = req.user_id;
        const { tour_id } = req.body;

        if (!user_id) {
            res.status(401).json({ message: 'Unauthorized: Missing user ID' });
            return;
        }

        if (!tour_id) {
            res.status(400).json({ message: 'Tour ID is required' });
            return;
        }

        const existing = await Favorite.findOne({ where: { user_id, tour_id } });

        if (existing) {
            res.status(409).json({ message: 'Tour already in favorites' });
            return;
        }

        const favorite = await Favorite.create({ user_id, tour_id });
        res.status(201).json(favorite);
    } catch (error) {
        console.error('Add to favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Remove a tour from user's favorites ---
export const removeFromFavorites = async (
    req: AuthenticatedRequest<TourIdParams>,
    res: Response
): Promise<void> => {
    try {
        const user_id = req.user_id;
        const { tour_id } = req.params;

        const deleted = await Favorite.destroy({
            where: { user_id, tour_id },
        });

        if (deleted === 0) {
            res.status(404).json({ message: 'Favorite entry not found' });
            return;
        }

        res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Remove from favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Get user's paginated favorites ---
export const getUserFavorites = async (
    req: AuthenticatedRequest<{},{},{},IPaginationQuery>,
    res: Response
): Promise<void> => {
    try {
        const user_id = req.user_id;
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Favorite.findAndCountAll({
            where: { user_id },
            include: [
                {
                    model: Tour,
                    include: [
                        {
                            model: TourImage,
                            as: 'TourImages',
                            where: { is_cover: true },
                            required: false,
                            attributes: ['image_url'],
                        },
                    ],
                },
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });

        const favorites = rows.map((favoriteItem) => {
            const favorite = favoriteItem.toJSON();
            const tour = favorite.Tour;

            return {
                favorite_id: favorite.favorite_id,
                user_id: favorite.user_id,
                created_at: favorite.created_at,
                updated_at: favorite.updated_at,
                tour: {
                    tour_id: tour?.tour_id,
                    name: tour?.name,
                    description: tour?.description,
                    price: tour?.price,
                    start_date: tour?.start_date,
                    end_date: tour?.end_date,
                    available_spots: tour?.available_spots,
                    image: tour?.TourImages?.[0]?.image_url
                        ? addSupabaseUrl(tour.TourImages[0].image_url, TOURS_BUCKET)
                        : null,
                },
            };
        });

        res.status(200).json({
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            favorites,
        });
    } catch (error) {
        console.error('Get favorite error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Check if a specific tour is in user's favorites ---
export const checkFavorite = async (
    req: AuthenticatedRequest<TourIdParams>,
    res: Response
): Promise<void> => {
    try {
        const user_id = req.user_id;
        const { tour_id } = req.params;

        const favoriteItem = await Favorite.findOne({
            where: { user_id, tour_id },
        });

        res.status(200).json({ inFavorites: !!favoriteItem });
    } catch (error) {
        console.error('Error checking favorites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
