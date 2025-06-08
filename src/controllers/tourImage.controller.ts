import { Response } from 'express';
import { uploadAndProcessImages, deleteFromSupabase } from '../utils';
import { TOURS_BUCKET } from '../constants';
import { Tour, TourImage } from '../db/models';
import { AuthenticatedRequest, TypedRequest } from '../types';

// Route param types
interface TourIdParam {
    tour_id: number;
}

interface ImageParamAndBody {
    tour_id: number;
    image_id: string;
}

// Add images (Admin)
export const addImagesToTour = async (
    req: AuthenticatedRequest<TourIdParam>,
    res: Response
): Promise<void> => {
    const tour_id = req.params.tour_id;
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

        const existingImageCount = await TourImage.count({ where: { tour_id } });
        if (existingImageCount + files.length > 10) {
            res.status(400).json({ message: 'A tour can have a maximum of 10 images.' });
            return;
        }

        const imagePaths = await uploadAndProcessImages(files, TOURS_BUCKET, tour_id.toString());

        const newImages = await TourImage.bulkCreate(
            imagePaths.map((path) => ({
                tour_id,
                image_url: path,
                is_cover: false,
            }))
        );

        res.status(201).json(newImages);
    } catch (error) {
        console.error('Add Image Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get images (Public)
export const getImagesForTour = async (
    req: TypedRequest<TourIdParam>,
    res: Response
): Promise<void> => {
    const { tour_id } = req.params;

    try {
        const images = await TourImage.findAll({ where: { tour_id } });
        res.json(images);
    } catch (error) {
        console.error('Get Images Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Set cover (Admin)
export const setCoverImage = async (
    req: AuthenticatedRequest<{}, {}, ImageParamAndBody>,
    res: Response
): Promise<void> => {
    const { tour_id, image_id } = req.body;

    try {
        await TourImage.update({ is_cover: false }, { where: { tour_id } });
        await TourImage.update({ is_cover: true }, { where: { image_id } });
        res.json({ message: 'Cover image updated.' });
    } catch (err) {
        console.error('Set Cover Image Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Delete image (Admin)
export const deleteImageForTour = async (
    req: TypedRequest<ImageParamAndBody>,
    res: Response
): Promise<void> => {
    const { tour_id, image_id } = req.params;

    try {
        const image = await TourImage.findOne({
            where: { tour_id, image_id: image_id },
        });

        if (!image) {
            res.status(404).json({ message: 'Image not found.' });
            return;
        }

        const wasCover = image.is_cover;

        await deleteFromSupabase(image.image_url, TOURS_BUCKET);
        await image.destroy();

        if (wasCover) {
            const otherImage = await TourImage.findOne({
                where: { tour_id },
                order: [['image_id', 'ASC']],
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
