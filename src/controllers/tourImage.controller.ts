import { Response } from 'express';
import { uploadAndProcessImages, deleteFromSupabase, BadRequestError, NotFoundError } from '../utils';
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
        throw new BadRequestError('Invalid tour ID.');
    }

    if (!files || !Array.isArray(files)) {
        throw new BadRequestError('No files uploaded');
    }

    const tour = await Tour.findByPk(tour_id);
    if (!tour) {
        throw new NotFoundError('Tour not found.');
    }

    const existingImageCount = await TourImage.count({ where: { tour_id } });
    if (existingImageCount + files.length > 10) {
        throw new BadRequestError('A tour can have a maximum of 10 images.');
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
};

// Get images (Public)
export const getImagesForTour = async (
    req: TypedRequest<TourIdParam>,
    res: Response
): Promise<void> => {
    const { tour_id } = req.params;

    const images = await TourImage.findAll({ where: { tour_id } });
    res.json(images);
};

// Set cover (Admin)
export const setCoverImage = async (
    req: AuthenticatedRequest<{}, {}, ImageParamAndBody>,
    res: Response
): Promise<void> => {
    const { tour_id, image_id } = req.body;

    await TourImage.update({ is_cover: false }, { where: { tour_id } });
    await TourImage.update({ is_cover: true }, { where: { image_id } });
    res.json({ message: 'Cover image updated.' });
};

// Delete image (Admin)
export const deleteImageForTour = async (
    req: TypedRequest<ImageParamAndBody>,
    res: Response
): Promise<void> => {
    const { tour_id, image_id } = req.params;

    const image = await TourImage.findOne({
        where: { tour_id, image_id },
    });

    if (!image) {
        throw new NotFoundError('Image not found.');
    }

    // 🔎 Count how many images exist for this tour
    const imageCount = await TourImage.count({ where: { tour_id } });
    if (imageCount <= 1) {
        throw new BadRequestError('At least one image must remain for this tour.');
    }

    const wasCover = image.is_cover;

    await deleteFromSupabase(image.image_url, TOURS_BUCKET);
    await image.destroy();

    // If deleted image was cover, assign cover to another
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
};
