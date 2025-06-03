import db from '../db/models/index.ts';
import {TOURS_BUCKET} from "../constants/index.ts";
import {addSupabaseUrl} from "../utils/index.ts";

const { Wishlist, Tour } = db;

export const addToWishlist = async (req, res) => {
    try {
        const user_id = req.user_id;
        const { tour_id } = req.body;

        if (!tour_id) {
            return res.status(400).json({ message: 'Tour ID is required' });
        }

        // Prevent duplicates
        const existing = await Wishlist.findOne({ where: { user_id, tour_id } });
        if (existing) {
            return res.status(409).json({ message: 'Tour already in wishlist' });
        }

        const wishlist = await Wishlist.create({ user_id, tour_id });
        res.status(201).json(wishlist);
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const user_id = req.user_id;
        const { tour_id } = req.params;

        const deleted = await Wishlist.destroy({
            where: { user_id, tour_id }
        });

        if (deleted === 0) {
            return res.status(404).json({ message: 'Wishlist entry not found' });
        }

        res.status(200).json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserWishlists = async (req, res) => {
    try {
        const user_id = req.user_id;

        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '10', 10);
        const offset = (page - 1) * limit;

        const { count, rows } = await Wishlist.findAndCountAll({
            where: { user_id },
            include: [
                {
                    model: Tour,
                    include: [
                        {
                            model: db.TourImage,
                            as: 'TourImages',
                            where: { is_cover: true },
                            required: false,
                            attributes: ['image_url'],
                        },
                    ],
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const wishlists = rows.map((wishlistItem) => {
            const wishlist = wishlistItem.toJSON();
            const tour = wishlist.Tour;

            return {
                wishlist_id: wishlist.wishlist_id,
                user_id: wishlist.user_id,
                created_at: wishlist.createdAt,
                updated_at: wishlist.updatedAt,
                tour: {
                    tour_id: tour.tour_id,
                    name: tour.name,
                    description: tour.description,
                    price: tour.price,
                    start_date: tour.start_date,
                    end_date: tour.end_date,
                    available_spots: tour.available_spots,
                    image: tour.TourImages?.[0]?.image_url
                        ? addSupabaseUrl(tour.TourImages[0].image_url, TOURS_BUCKET)
                        : null
                }
            };
        });

        res.status(200).json({
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            wishlists,
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const checkWishlist = async (req, res) => {
    try {
        const user_id = req.user_id;
        const { tour_id } = req.params;

        const wishlistItem = await Wishlist.findOne({
            where: { user_id: user_id, tour_id: tour_id }
        });

        if (wishlistItem) {
            return res.status(200).json({ inWishlist: true });
        }

        return res.status(200).json({ inWishlist: false });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
