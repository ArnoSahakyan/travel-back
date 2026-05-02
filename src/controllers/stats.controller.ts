import { Response } from 'express';
import { TypedRequest } from '../types';
import { User, Booking, Tour, Destination, Category, Review, Contact, sequelize } from '../db/models';

export const getAdminStats = async (
    req: TypedRequest<{}>,
    res: Response
): Promise<void> => {
    try {
        const [
            totalUsers,
            totalBookings,
            totalTours,
            totalDestinations,
            totalCategories,
            totalReviews,
            unreadMessages,
            revenueResult
        ] = await Promise.all([
            User.count(),
            Booking.count(),
            Tour.count(),
            Destination.count(),
            Category.count(),
            Review.count(),
            Contact.count({ where: { status: 'unread' } }),
            Booking.sum('total_price', { where: { status: 'completed' } })
        ]);

        const recentBookings = await Booking.findAll({
            limit: 5,
            order: [['booking_date', 'DESC']],
            include: [
                { model: User, attributes: ['full_name', 'email'] },
                { model: Tour, attributes: ['name'] }
            ]
        });

        res.status(200).json({
            metrics: {
                totalUsers,
                totalBookings,
                totalTours,
                totalDestinations,
                totalCategories,
                totalReviews,
                unreadMessages,
                totalRevenue: revenueResult || 0
            },
            recentBookings
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve stats' });
    }
};
