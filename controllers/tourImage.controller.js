import db from '../models/index.js';
import { uploadAndProcessImages, deleteFromSupabase } from '../utils/imageUpload.js';

const { Tour, TourImage } = db;

// Add an image to a tour (Admin only)
export const addImagesToTour = async (req, res) => {
    const { tourId } = req.params;
    const files = req.files;

    try {
        const tour = await Tour.findByPk(tourId);

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found.' });
        }

        const existingImageCount = await TourImage.count({ where: { tour_id: tourId } });

        if (existingImageCount + files.length > 10) {
            return res.status(400).json({ message: 'A tour can have a maximum of 10 images.' });
        }

        const imagePaths = await uploadAndProcessImages(files, 'tour-images', tourId);

        const newImages = await TourImage.bulkCreate(
            imagePaths.map(path => ({
                tour_id: tourId,
                image_url: path,
                is_cover: false
            }))
        );

        res.status(201).json(newImages);
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

// Set cover image for a tour (Admin only)
export const setCoverImage = async (req, res) => {
    const { tourId, imageId } = req.body;

    try {
        // Unset current cover image
        await TourImage.update({ is_cover: false }, { where: { tour_id: tourId } });

        // Set new cover image
        await TourImage.update({ is_cover: true }, { where: { image_id: imageId } });

        res.json({ message: 'Cover image updated.' });
    } catch (err) {
        console.error('Set Cover Image Error:', err);
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

        const wasCover = image.is_cover;

        // Delete image from Supabase storage
        await deleteFromSupabase(image.image_url, 'tour-images');

        // Delete image record from the DB
        await image.destroy();

        // If the deleted image was the cover, set another image as cover
        if (wasCover) {
            const otherImage = await TourImage.findOne({
                where: { tour_id: tourId },
                order: [['image_id', 'ASC']] // pick the next image as cover
            });

            if (otherImage) {
                await otherImage.update({ is_cover: true });
            }
        }

        res.json({ message: 'Image deleted successfully.' });
    } catch (error) {
        console.error('Delete Image Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
