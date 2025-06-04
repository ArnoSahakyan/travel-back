import { Request, Response } from 'express';
import {AuthenticatedRequest} from "../types";
import {Review, User, Tour, sequelize} from '../db/models';

export const createReview = async (req: AuthenticatedRequest, res: Response) => {
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

        // Prevent duplicate reviews by the same user for the same tour
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

export const getAllReviews = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 4;
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
                Tour: undefined
            }
        })
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


export const getReviewsForTour = async (req: Request, res: Response) => {
    try {
        const { tour_id } = req.params;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 4;
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
                Tour: undefined
            }
        })

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

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const { review_id } = req.params;

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

