import db from '../models/index.js';

const {Booking, Tour, User} = db;

// Get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [{ model: User }, { model: Tour }]
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
}

// Get a single booking by ID
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [{ model: User }, { model: Tour }]
        });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
}

// Create a new booking
export const createBooking = async (req, res) => {
    try {
        const { user_id, tour_id, num_travelers } = req.body;
        const newBooking = await Booking.create({
            user_id, tour_id, num_travelers, status: 'pending'
        });
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
}

// Update a booking
export const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        await booking.update(req.body);
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update booking' });
    }
}

// Delete a booking
export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        await booking.destroy();
        res.status(204).json();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete booking' });
    }
}
