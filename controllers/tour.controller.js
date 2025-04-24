import db from '../models/index.js'; // assuming Sequelize models

const { Tour, Destination, TourCategory, TourImage } = db;
// Get all tours
export const getAllTours = async (req, res) => {
    try {
        const tours = await Tour.findAll({
            include: [{ model: Destination }, { model: TourCategory }, { model: TourImage }]
        });
        res.json(tours);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tours' });
    }
};

// Get a single tour by ID
export const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id, {
            include: [{ model: Destination }, { model: TourCategory }, { model: TourImage }]
        });
        if (!tour) {
            return res.status(404).json({ error: 'Tour not found' });
        }
        res.json(tour);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tour' });
    }
};

// Create a new tour
export const createTour = async (req, res) => {
    try {
        const { name, description, price, start_date, end_date, destination_id, category_id, capacity } = req.body;
        const newTour = await Tour.create({
            name, description, price, start_date, end_date, destination_id, category_id, capacity
        });
        res.status(201).json(newTour);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create tour' });
    }
};

// Update a tour
export const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id);
        if (!tour) {
            return res.status(404).json({ error: 'Tour not found' });
        }
        await tour.update(req.body);
        res.json(tour);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update tour' });
    }
};

// Delete a tour
export const deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id);
        if (!tour) {
            return res.status(404).json({ error: 'Tour not found' });
        }
        await tour.destroy();
        res.status(204).json();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete tour' });
    }
};
