import db from "../models/index.js";

const { Booking, Tour, User } = db;

export const createBooking = async (req, res) => {
    try {
        const user_id = req.userId;
        const { tour_id, number_of_people } = req.body;

        // 1. Validate input
        if (!tour_id || !number_of_people || number_of_people < 1) {
            return res.status(400).json({ message: 'Invalid booking data' });
        }

        // 2. Fetch tour
        const tour = await Tour.findByPk(tour_id);
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' });
        }

        // 3. Check available spots
        if (tour.available_spots < number_of_people) {
            return res.status(400).json({ message: 'Not enough spots available' });
        }

        // 4. Calculate total price
        const total_price = tour.price * number_of_people;

        // 5. Create booking
        const booking = await Booking.create({
            user_id,
            tour_id,
            number_of_people,
            total_price
        });

        // 6. Update available spots
        tour.available_spots -= number_of_people;
        await tour.save();

        res.status(201).json(booking);
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const user_id = req.userId;
        const booking_id = parseInt(req.params.booking_id, 10);

        // Find the booking
        const booking = await Booking.findByPk(booking_id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Load the requesting user and their role
        const user = await User.findByPk(user_id, {
            include: {
                association: 'Role',
                attributes: ['role_name']
            }
        });

        const isAdmin = user?.Role?.role_name === 'admin';

        // Ensure the user is either the one who made the booking or is an admin
        if (booking.user_id !== user_id && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Get the tour and check cancellation window
        const tour = await Tour.findByPk(booking.tour_id);
        if (!tour) {
            return res.status(500).json({ message: 'Associated tour not found' });
        }

        const now = new Date();
        const startDate = new Date(tour.start_date);
        const diffInDays = (startDate - now) / (1000 * 60 * 60 * 24);

        if (!isAdmin && diffInDays < 3) {
            return res.status(400).json({
                message: 'Bookings can only be cancelled at least 3 days before the tour starts.'
            });
        }

        // Restore available spots
        tour.available_spots += booking.number_of_people;
        await tour.save();

        // Delete the booking
        await booking.destroy();

        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUsersBookings = async (req, res) => {
    const user_id = req.userId;
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const offset = (page - 1) * limit;

        const { count, rows } = await Booking.findAndCountAll({
            where: { user_id },
            include: [
                {
                    model: Tour,
                    include: ['Destination', 'TourCategory', 'TourImages']
                }
            ],
            order: [['booking_date', 'DESC']],
            limit,
            offset
        });

        res.status(200).json({
            total: count,
            page,
            totalPages: Math.ceil(count / limit),
            bookings: rows
        });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '10');
        const offset = (page - 1) * limit;

        const { count, rows } = await Booking.findAndCountAll({
            include: [
                {
                    model: Tour,
                    include: ['Destination', 'TourCategory']
                },
                {
                    model: User,
                    attributes: ['user_id', 'full_name', 'email']
                }
            ],
            order: [['booking_date', 'DESC']],
            limit,
            offset
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
