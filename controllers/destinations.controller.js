import db from '../models/index.js';
import { deleteFromSupabase, uploadAndProcessImages } from '../utils/imageUpload.js'; // your helper function

const { Destination } = db;

// Create Destination (Admin only)
export const createDestination = async (req, res) => {
    const { name, description } = req.body;
    const file = req.files;

    try {
        let imagePath = null;

        if (file) {
            const uploaded = await uploadAndProcessImages(file, 'destination-images', name.replace(/\s+/g, '_'));
            imagePath = uploaded[0];
        }

        const destination = await Destination.create({
            name,
            description,
            image: imagePath
        });

        res.status(201).json(destination);
    } catch (error) {
        console.error('Create Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Update Destination (Admin only)
export const updateDestination = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const file = req.files;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found.' });
        }

        let imagePath = destination.image;

        if (file) {
            // Delete the old image if it exists
            if (imagePath) {
                await deleteFromSupabase(imagePath, 'destination-images');
            }

            const uploaded = await uploadAndProcessImages(file, 'destination-images', id);
            imagePath = uploaded[0];
        }

        await destination.update({
            name,
            description,
            image: imagePath
        });

        res.json(destination);
    } catch (error) {
        console.error('Update Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getAllDestinations = async (req, res) => {
    try {
        const destinations = await Destination.findAll();
        res.json(destinations);
    } catch (error) {
        console.error('Get All Destinations Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

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

export const deleteDestination = async (req, res) => {
    const { id } = req.params;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found.' });
        }

        // Delete image from Supabase if exists
        if (destination.image) {
            await deleteFromSupabase(destination.image, 'destination-images');
        }

        await destination.destroy();

        res.json({ message: 'Destination deleted successfully.' });
    } catch (error) {
        console.error('Delete Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
