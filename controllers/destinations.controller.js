import db from '../models/index.js';

const { Destination } = db;

// Create Destination (Admin only)
export const createDestination = async (req, res) => {
    const { name, description, country, city, image } = req.body;

    try {
        const destination = await Destination.create({ name, description, country, city, image });
        res.status(201).json(destination);
    } catch (error) {
        console.error('Create Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get all Destinations (Public)
export const getAllDestinations = async (req, res) => {
    try {
        const destinations = await Destination.findAll();
        res.json(destinations);
    } catch (error) {
        console.error('Get All Destinations Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get a single Destination by ID (Public)
export const getDestinationById = async (req, res) => {
    const { id } = req.params;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found.' });
        }

        res.json(destination);
    } catch (error) {
        console.error('Get Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Update Destination by ID (Admin only)
export const updateDestination = async (req, res) => {
    const { id } = req.params;
    const { name, description, country, city, image } = req.body;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found.' });
        }

        await destination.update({ name, description, country, city, image });

        res.json(destination);
    } catch (error) {
        console.error('Update Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Delete Destination by ID (Admin only)
export const deleteDestination = async (req, res) => {
    const { id } = req.params;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found.' });
        }

        await destination.destroy();

        res.json({ message: 'Destination deleted successfully.' });
    } catch (error) {
        console.error('Delete Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
