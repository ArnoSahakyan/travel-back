import { Request, Response } from 'express';
import { uploadAndProcessImages, deleteFromSupabase } from '../utils';
import {TOURS_BUCKET} from "../constants";

import { Tour, TourImage } from '../db/models';
import {AuthenticatedRequest} from "../types";

// Add an image to a tour (Admin only)
export const addImagesToTour = async (req: AuthenticatedRequest, res: Response) => {
    const tour_id = parseInt(req.params.tour_id, 10);
    const files = req.files;

    if (isNaN(tour_id)) {
        res.status(400).json({ message: 'Invalid tour ID.' });
        return;
    }

    if (!files || !Array.isArray(files)) {
        res.status(400).json({ message: 'No files uploaded' });
        return;
    }

    try {
        const tour = await Tour.findByPk(tour_id);

        if (!tour) {
            res.status(404).json({ message: 'Tour not found.' });
            return;
        }

        const existingImageCount = await TourImage.count({ where: { tour_id: tour_id } });

        if (existingImageCount + files.length > 10) {
            res.status(400).json({ message: 'A tour can have a maximum of 10 images.' });
            return;
        }

        const imagePaths = await uploadAndProcessImages(files, TOURS_BUCKET, tour_id);

        const newImages = await TourImage.bulkCreate(
            imagePaths.map(path => ({
                tour_id: tour_id,
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
export const getImagesForTour = async (req: Request, res: Response) => {
    const { tour_id } = req.params;

    try {
        const images = await TourImage.findAll({
            where: { tour_id: tour_id }
        });

        res.json(images);
    } catch (error) {
        console.error('Get Images Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Set cover image for a tour (Admin only)
export const setCoverImage = async (req: AuthenticatedRequest, res: Response) => {
    const { tour_id, imageId } = req.body;

    try {
        // Unset current cover image
        await TourImage.update({ is_cover: false }, { where: { tour_id: tour_id } });

        // Set new cover image
        await TourImage.update({ is_cover: true }, { where: { image_id: imageId } });

        res.json({ message: 'Cover image updated.' });
    } catch (err) {
        console.error('Set Cover Image Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Delete an image for a tour (Admin only)
export const deleteImageForTour = async (req: Request, res: Response) => {
    const { tour_id, imageId } = req.params;

    try {
        const image = await TourImage.findOne({
            where: { tour_id: tour_id, image_id: imageId }
        });

        if (!image) {
            res.status(404).json({ message: 'Image not found.' });
            return;
        }

        const wasCover = image.is_cover;

        // Delete image from Supabase storage
        await deleteFromSupabase(image.image_url, TOURS_BUCKET);

        // Delete image record from the DB
        await image.destroy();

        // If the deleted image was the cover, set another image as cover
        if (wasCover) {
            const otherImage = await TourImage.findOne({
                where: { tour_id: tour_id },
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
