import { Request, Response } from 'express';
import { addSupabaseUrl } from '../utils';
import { TOURS_BUCKET } from '../constants';
import {Booking, Tour, User, Role, Destination, Category, TourImage} from '../db/models';
import {AuthenticatedRequest} from "../types";

export const createBooking = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const user_id = req.user_id;

        if (!user_id) {
            res.status(401).json({ message: 'Unauthorized: Missing user ID' });
            return;
        }

        const { tour_id, number_of_people } = req.body;

        if (!tour_id || !number_of_people || number_of_people < 1) {
            res.status(400).json({ message: 'Invalid booking data' });
            return;
        }

        const tour = await Tour.findByPk(tour_id);
        if (!tour) {
            res.status(404).json({ message: 'Tour not found' });
            return;
        }

        if (tour.available_spots < number_of_people) {
            res.status(400).json({ message: 'Not enough spots available' });
            return;
        }

        const total_price = tour.price * number_of_people;

        const booking = await Booking.create({
            user_id,
            tour_id,
            number_of_people,
            total_price
        });

        tour.available_spots -= number_of_people;
        await tour.save();

        res.status(201).json(booking);
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const cancelBooking = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const user_id = req.user_id;
        const booking_id = parseInt(req.params.booking_id, 10);

        const booking = await Booking.findByPk(booking_id);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        const user = await User.findByPk(user_id, {
            include: {
                association: 'Role',
                attributes: ['name']
            }
        });

        const isAdmin = user?.Role?.name === 'admin';

        if (booking.user_id !== user_id && !isAdmin) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        const tour = await Tour.findByPk(booking.tour_id);
        if (!tour) {
            res.status(500).json({ message: 'Associated tour not found' });
            return;
        }

        const now = new Date();
        const startDate = new Date(tour.start_date);
        const diffInDays = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        if (!isAdmin && diffInDays < 3) {
            res.status(400).json({
                message: 'Bookings can only be cancelled at least 3 days before the tour starts.'
            });
            return;
        }

        tour.available_spots += booking.number_of_people;
        await tour.save();
        await booking.destroy();

        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUsersBookings = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const user_id = req.user_id;

    try {
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '10');
        const offset = (page - 1) * limit;

        const { count, rows } = await Booking.findAndCountAll({
            where: { user_id },
            include: [
                {
                    model: Tour,
                    include: [Destination, Category, TourImage]
                }
            ],
            order: [['booking_date', 'DESC']],
            limit,
            offset,
            distinct: true
        });

        const bookings = rows.map((booking) => {
            const tour = booking.Tour;
            const coverImage = tour?.TourImages?.find((img) => img.is_cover);

            return {
                booking_id: booking.booking_id,
                booking_date: booking.booking_date,
                number_of_people: booking.number_of_people,
                total_price: booking.total_price,
                status: booking.status,
                tour_name: tour?.name,
                start_date: tour?.start_date,
                end_date: tour?.end_date,
                destination_name: tour?.Destination?.name || null,
                category_name: tour?.Category?.name || null,
                image: coverImage ? addSupabaseUrl(coverImage.image_url, TOURS_BUCKET) : null
            };
        });

        res.status(200).json({
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            bookings
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getBookingById = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const user_id = req.user_id;
        const booking_id = parseInt(req.params.booking_id, 10);

        const booking = await Booking.findByPk(booking_id, {
            include: [
                {
                    model: Tour,
                    include: [Destination, Category, TourImage]
                },
                {
                    model: User,
                    include: [
                        {
                            model: Role,
                            as: 'Role',
                            attributes: ['name']
                        }
                    ],
                    attributes: ['user_id', 'full_name', 'email']
                }
            ]

        });

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        const isOwner = booking.user_id === user_id;
        const isAdmin = booking.User?.Role?.name === 'admin';

        if (!isOwner && !isAdmin) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        const tour = booking.Tour;
        const coverImage = tour?.TourImages?.find((img) => img.is_cover);

        const response = {
            booking_id: booking.booking_id,
            booking_date: booking.booking_date,
            number_of_people: booking.number_of_people,
            total_price: booking.total_price,
            status: booking.status,
            tour_id: tour?.tour_id,
            tour_name: tour?.name,
            start_date: tour?.start_date,
            end_date: tour?.end_date,
            destination_name: tour?.Destination?.name || null,
            category_name: tour?.Category?.name || null,
            image: coverImage ? addSupabaseUrl(coverImage.image_url, TOURS_BUCKET) : null,
            user: isAdmin
                ? {
                    user_id: booking.User?.user_id,
                    full_name: booking.User?.full_name,
                    email: booking.User?.email
                }
                : undefined
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching booking by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllBookings = async (req: Request, res: Response) => {
    try {
        const page = parseInt((req.query.page as string) || '1');
        const limit = parseInt((req.query.limit as string) || '10');
        const offset = (page - 1) * limit;

        const { count, rows } = await Booking.findAndCountAll({
            include: [
                {
                    model: Tour,
                    include: ['Destination', 'Category']
                },
                {
                    model: User,
                    attributes: ['user_id', 'full_name', 'email']
                }
            ],
            order: [['booking_date', 'DESC']],
            limit,
            offset,
            distinct: true
        });

        res.status(200).json({
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            bookings: rows
        });
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
