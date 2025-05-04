import db from '../models/index.js';
import {deleteFromSupabase, uploadAndProcessImages} from '../utils/imageUpload.js';

const { Tour, TourImage } = db;

// Create Tour (Admin only)
export const createTour = async (req, res) => {
    const { name, description, price, start_date, end_date, category_id, destination_id } = req.body;
    const files = req.files;
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

        // Upload and process images if any
        if (files && files.length > 0) {
            const imagePaths = await uploadAndProcessImages(files, 'tour-images', tour.tour_id);

            const imageRecords = imagePaths.map((path, index) => ({
                tour_id: tour.tour_id,
                image_url: path,
                is_cover: index === 0
            }));

            await TourImage.bulkCreate(imageRecords);
        }

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
            include: [
                {
                    model: db.TourImage,
                    as: 'TourImages',
                    where: { is_cover: true },
                    required: false,
                    attributes: ['image_url']
                },
                { model: db.Destination, as: 'Destination' }
            ]
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
            include: [
                { model: db.TourImage, as: 'TourImages' },
                { model: db.Destination, as: 'Destination' }
            ]
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
        const tour = await Tour.findByPk(id, {
            include: [
                { model: TourImage, as: 'TourImages' }
            ]
        });

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found.' });
        }

        // Delete all associated images from Supabase
        for (const image of tour.TourImages) {
            if (image.image_url) {
                await deleteFromSupabase(image.image_url, 'tour-images');
            }
        }

        // Delete TourImages records from DB
        await TourImage.destroy({ where: { tour_id: id } });

        // Delete the tour itself
        await tour.destroy();

        res.json({ message: 'Tour deleted successfully.' });
    } catch (error) {
        console.error('Delete Tour Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
