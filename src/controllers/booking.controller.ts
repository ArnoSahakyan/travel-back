import { Response } from 'express';
import { addSupabaseUrl, UnauthorizedError, BadRequestError, NotFoundError, ForbiddenError } from '../utils';
import { TOURS_BUCKET } from '../constants';
import { Booking, Tour, User, Role, Destination, Category, TourImage } from '../db/models';
import { AuthenticatedRequest, IPaginationQuery, TypedRequest } from '../types';

export interface CreateBookingBody {
    tour_id: number;
    number_of_people: number;
}

export interface CancelBookingParams {
    booking_id: number;
}

export interface GetBookingByIdParams {
    booking_id: number;
}

export const createBooking = async (
    req: AuthenticatedRequest<{}, {}, CreateBookingBody>,
    res: Response
) => {
    const user_id = req.user_id;
    if (!user_id) {
        throw new UnauthorizedError('Unauthorized: Missing user ID');
    }

    const { tour_id, number_of_people } = req.body;
    if (!tour_id || !number_of_people || number_of_people < 1) {
        throw new BadRequestError('Invalid booking data');
    }

    const tour = await Tour.findByPk(tour_id);
    if (!tour) {
        throw new NotFoundError('Tour not found');
    }

    if (tour.available_spots < number_of_people) {
        throw new BadRequestError('Not enough spots available');
    }

    const total_price = tour.price * number_of_people;
    const booking = await Booking.create({ user_id, tour_id, number_of_people, total_price });

    tour.available_spots -= number_of_people;
    await tour.save();

    res.status(201).json(booking);
};

export const cancelBooking = async (
    req: AuthenticatedRequest<CancelBookingParams>,
    res: Response
) => {
    const user_id = req.user_id;
    const booking_id = req.params.booking_id;

    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
        throw new NotFoundError('Booking not found');
    }

    const user = await User.findByPk(user_id, {
        include: {
            association: 'Role',
            attributes: ['name']
        }
    });

    const isAdmin = user?.Role?.name === 'admin';
    if (booking.user_id !== user_id && !isAdmin) {
        throw new ForbiddenError('Unauthorized');
    }

    const tour = await Tour.findByPk(booking.tour_id);
    if (!tour) {
        throw new NotFoundError('Associated tour not found');
    }

    const now = new Date();
    const startDate = new Date(tour.start_date);
    const diffInDays = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (!isAdmin && diffInDays < 3) {
        throw new BadRequestError('Bookings can only be cancelled at least 3 days before the tour starts.');
    }

    tour.available_spots += booking.number_of_people;
    await tour.save();
    await booking.destroy();

    res.status(200).json({ message: 'Booking cancelled successfully' });
};

export const getUsersBookings = async (
    req: AuthenticatedRequest<{}, {}, {}, IPaginationQuery>,
    res: Response
) => {
    const user_id = req.user_id;

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
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
};

export const getBookingById = async (
    req: AuthenticatedRequest<GetBookingByIdParams>,
    res: Response
) => {
    const user_id = req.user_id;
    const booking_id = req.params.booking_id;

    const booking = await Booking.findByPk(booking_id, {
        include: [
            {
                model: Tour,
                include: [Destination, Category, TourImage]
            },
            {
                model: User,
                include: [{ model: Role, as: 'Role', attributes: ['name'] }],
                attributes: ['user_id', 'full_name', 'email']
            }
        ]
    });

    if (!booking) {
        throw new NotFoundError('Booking not found');
    }

    const isOwner = booking.user_id === user_id;
    const isAdmin = booking.User?.Role?.name === 'admin';

    if (!isOwner && !isAdmin) {
        throw new ForbiddenError('Unauthorized');
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
};

export const getAllBookings = async (
    req: TypedRequest<{}, {}, {}, IPaginationQuery>,
    res: Response
) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
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
};
