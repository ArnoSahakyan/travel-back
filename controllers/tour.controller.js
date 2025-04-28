import db from '../models/index.js';

const { Tour } = db;

// Create Tour (Admin only)
export const createTour = async (req, res) => {
    const { name, description, price, start_date, end_date, category_id, destination_id } = req.body;

    try {
        const tour = await Tour.create({
            name,
            description,
            price,
            start_date,
            end_date,
            category_id,
            destination_id
        });
        res.status(201).json(tour);
    } catch (error) {
        console.error('Create Tour Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get all Tours (Public)
export const getAllTours = async (req, res) => {
    try {
        const tours = await Tour.findAll({
            include: [{ model: db.Destination, as: 'Destination' }] // If you want to include destination details
        });
        res.json(tours);
    } catch (error) {
        console.error('Get All Tours Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get a single Tour by ID (Public)
export const getTourById = async (req, res) => {
    const { id } = req.params;

    try {
        const tour = await Tour.findByPk(id, {
            include: [{ model: db.Destination, as: 'Destination' }] // Include destination if needed
        });

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found.' });
        }

        res.json(tour);
    } catch (error) {
        console.error('Get Tour Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Update Tour by ID (Admin only)
export const updateTour = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, start_date, end_date, category_id, destination_id } = req.body;

    try {
        const tour = await Tour.findByPk(id);

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found.' });
        }

        await tour.update({
            name,
            description,
            price,
            start_date,
            end_date,
            category_id,
            destination_id
        });

        res.json(tour);
    } catch (error) {
        console.error('Update Tour Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Delete Tour by ID (Admin only)
export const deleteTour = async (req, res) => {
    const { id } = req.params;

    try {
        const tour = await Tour.findByPk(id);

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found.' });
        }

        await tour.destroy();

        res.json({ message: 'Tour deleted successfully.' });
    } catch (error) {
        console.error('Delete Tour Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
