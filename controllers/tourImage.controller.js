import db from '../models/index.js';

const { TourImage } = db;

// Add an image to a tour (Admin only)
export const addImageToTour = async (req, res) => {
    const { tourId } = req.params;
    const { image_url } = req.body;

    try {
        const tour = await db.Tour.findByPk(tourId);

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found.' });
        }

        const image = await TourImage.create({
            tour_id: tourId,
            image_url
        });

        res.status(201).json(image);
    } catch (error) {
        console.error('Add Image Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get all images for a tour (Public)
export const getImagesForTour = async (req, res) => {
    const { tourId } = req.params;

    try {
        const images = await TourImage.findAll({
            where: { tour_id: tourId }
        });

        res.json(images);
    } catch (error) {
        console.error('Get Images Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Delete an image for a tour (Admin only)
export const deleteImageForTour = async (req, res) => {
    const { tourId, imageId } = req.params;

    try {
        const image = await TourImage.findOne({
            where: { tour_id: tourId, image_id: imageId }
        });

        if (!image) {
            return res.status(404).json({ message: 'Image not found.' });
        }

        await image.destroy();

        res.json({ message: 'Image deleted successfully.' });
    } catch (error) {
        console.error('Delete Image Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
