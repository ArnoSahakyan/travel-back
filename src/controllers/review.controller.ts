import { Response } from 'express';
import { AuthenticatedRequest, IPaginationQuery, TypedRequest } from '../types';
import { Review, User, Tour, sequelize } from '../db/models';
import { UnauthorizedError, BadRequestError, AppError, NotFoundError } from '../utils';

// --- Types ---
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
    const user_id = req.user_id;
    if (!user_id) {
        throw new UnauthorizedError('Unauthorized: Missing user ID');
    }

    const { tour_id, rating, comment } = req.body;

    if (!tour_id || !rating) {
        throw new BadRequestError('tour_id and rating are required');
    }

    const existingReview = await Review.findOne({
        where: { user_id, tour_id },
    });

    if (existingReview) {
        throw new AppError(409, 'You have already reviewed this tour');
    }

    const review = await Review.create({
        user_id,
        tour_id,
        rating,
        comment,
    });

    res.status(201).json(review);
};

export const getAllReviews = async (
    req: TypedRequest<{}, {}, {}, IPaginationQuery>,
    res: Response
): Promise<void> => {
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
};

export const getReviewsForTour = async (
    req: TypedRequest<TourIdParam, {}, {}, IPaginationQuery>,
    res: Response
): Promise<void> => {
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
};

export const deleteReview = async (
    req: TypedRequest<ReviewIdParam>,
    res: Response
): Promise<void> => {
    const review_id = req.params.review_id;

    const deleted = await Review.destroy({ where: { review_id } });

    if (!deleted) {
        throw new NotFoundError('Review not found');
    }

    res.status(200).json({ message: 'Review deleted successfully' });
};

export const getUserReviews = async (
    req: AuthenticatedRequest<{}, {}, {}, IPaginationQuery>,
    res: Response
): Promise<void> => {
    const user_id = req.user_id;

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
        where: { user_id },
        include: [
            {
                model: Tour,
                attributes: ['tour_id', 'name'],
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
            tour_name: review.Tour?.name,
            Tour: undefined,
        };
    });

    res.status(200).json({
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        reviews,
    });
};
