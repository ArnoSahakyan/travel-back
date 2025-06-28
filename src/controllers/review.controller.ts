import { Response } from 'express';
import {AuthenticatedRequest, IPaginationQuery, TypedRequest} from '../types';
import { Review, User, Tour, sequelize } from '../db/models';

// --- Types for request bodies, params and queries ---
type CreateReviewBody = {
    tour_id: number;
    rating: number;
    comment?: string;
};

type TourIdParam = {
    tour_id: number;
};

type ReviewIdParam = {
    review_id: number;
};

export const createReview = async (
    req: AuthenticatedRequest<{}, {}, CreateReviewBody>,
    res: Response
): Promise<void> => {
    try {
        const user_id = req.user_id;
        if (!user_id) {
            res.status(401).json({ message: 'Unauthorized: Missing user ID' });
            return;
        }

        const { tour_id, rating, comment } = req.body;

        if (!tour_id || !rating) {
            res.status(400).json({ message: 'tour_id and rating are required' });
            return;
        }

        const existingReview = await Review.findOne({
            where: { user_id, tour_id },
        });

        if (existingReview) {
            res.status(409).json({ message: 'You have already reviewed this tour' });
            return;
        }

        const review = await Review.create({
            user_id,
            tour_id,
            rating,
            comment,
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllReviews = async (
    req: TypedRequest<{}, {}, {}, IPaginationQuery>,
    res: Response
): Promise<void> => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 4;
        const offset = (page - 1) * limit;

        const { count, rows } = await Review.findAndCountAll({
            include: [
                {
                    model: User,
                    attributes: ['user_id', 'full_name'],
                },
                {
                    model: Tour,
                    attributes: ['name'],
                },
            ],
            order: sequelize.random(),
            limit,
            offset,
        });

        const reviews = rows.map((reviewItem) => {
            const review = reviewItem.toJSON();
            return {
                ...review,
                full_name: review.User?.full_name,
                tour_name: review.Tour?.name,
                User: undefined,
                Tour: undefined,
            };
        });

        res.status(200).json({
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            reviews,
        });
    } catch (error) {
        console.error('Error fetching random reviews:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getReviewsForTour = async (
    req: TypedRequest<TourIdParam, {}, {}, IPaginationQuery>,
    res: Response
): Promise<void> => {
    try {
        const tour_id = req.params.tour_id;

        const page = req.query.page || 1;
        const limit = req.query.limit || 4;
        const offset = (page - 1) * limit;

        const { count, rows } = await Review.findAndCountAll({
            where: { tour_id },
            include: [
                {
                    model: User,
                    attributes: ['user_id', 'full_name'],
                },
                {
                    model: Tour,
                    attributes: ['name'],
                },
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });

        const reviews = rows.map((reviewItem) => {
            const review = reviewItem.toJSON();
            return {
                ...review,
                full_name: review.User?.full_name,
                tour_name: review.Tour?.name,
                User: undefined,
                Tour: undefined,
            };
        });

        res.status(200).json({
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            reviews,
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteReview = async (
    req: TypedRequest<ReviewIdParam>,
    res: Response
): Promise<void> => {
    try {
        const review_id = req.params.review_id;

        const deleted = await Review.destroy({ where: { review_id } });

        if (!deleted) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
