import { Response } from 'express';
import {
    Category,
    Destination,
    Review,
    Tour,
    TourImage,
} from '../db/models';
import {
    addSupabaseUrl,
    deleteFromSupabase,
    formatDate,
    uploadAndProcessImages,
    NotFoundError,
    BadRequestError
} from '../utils';
import { TOURS_BUCKET } from '../constants';
import {
    AuthenticatedRequest,
    TypedRequest,
    CreateTourBody,
    UpdateTourBody,
    TourParams,
    GetFilteredToursQuery,
    GetTourByIdParams,
    GetTourByIdQuery,
} from '../types';
import { Op, WhereOptions } from 'sequelize';

// Create Tour (Admin only)
export const createTour = async (
    req: AuthenticatedRequest<{}, {}, CreateTourBody>,
    res: Response
): Promise<void> => {
    const {
        name,
        description,
        price,
        available_spots,
        start_date,
        end_date,
        category_id,
        destination_id,
    } = req.body;
    const files = req.files;

    if (!files || !Array.isArray(files)) {
        throw new BadRequestError('No files uploaded');
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const tour = await Tour.create({
        name,
        description,
        price,
        available_spots,
        start_date: startDate,
        end_date: endDate,
        category_id,
        destination_id,
    });

    if (files.length > 0) {
        const imagePaths = await uploadAndProcessImages(
            files,
            TOURS_BUCKET,
            tour.tour_id.toString()
        );

        const imageRecords = imagePaths.map((path, index) => ({
            tour_id: tour.tour_id,
            image_url: path,
            is_cover: index === 0,
        }));

        await TourImage.bulkCreate(imageRecords);
    }

    res.status(201).json(tour);
};

// Get Tours with Optional Filters (Public)
export const getFilteredTours = async (
    req: TypedRequest<{}, {}, {}, GetFilteredToursQuery>,
    res: Response
): Promise<void> => {
    const { category_id, destination_id, page = 1, limit = 10, search } = req.query;

    const offset = (page - 1) * limit;

    const baseCondition: WhereOptions = {};

    if (category_id) {
        baseCondition.category_id = category_id;
    }

    if (destination_id) {
        baseCondition.destination_id = destination_id;
    }

    const searchCondition: WhereOptions | undefined = search
        ? {
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ],
        }
        : undefined;

    const whereCondition: WhereOptions = searchCondition
        ? { [Op.and]: [baseCondition, searchCondition] }
        : baseCondition;

    const { count, rows } = await Tour.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        include: [
            {
                model: TourImage,
                as: 'TourImages',
                where: { is_cover: true },
                required: false,
                attributes: ['image_url'],
            },
        ],
    });

    const tours = rows.map((tour) => {
        const tourJson = tour.toJSON() as {
            TourImages?: { image_url: string }[];
            [key: string]: unknown;
        };

        const coverImage = tourJson.TourImages?.[0]?.image_url;

        return {
            ...tourJson,
            image: coverImage ? addSupabaseUrl(coverImage, TOURS_BUCKET) : null,
            TourImages: undefined,
        };
    });

    res.json({
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        tours,
    });
};

// Get a single Tour by ID (Public)
export const getTourById = async (
    req: TypedRequest<GetTourByIdParams, {}, {}, GetTourByIdQuery>,
    res: Response
): Promise<void> => {
    const id = req.params.id;
    const user_id = req.query.user_id;

    const tour = await Tour.findByPk(id, {
        include: [
            { model: TourImage, as: 'TourImages' },
            { model: Destination, as: 'Destination' },
            { model: Category, as: 'Category' },
        ],
    });

    if (!tour) {
        throw new NotFoundError('Tour not found.');
    }

    const plainTour = tour.get({ plain: true });

    const images = plainTour.TourImages?.map((img) => ({
        image_id: img.image_id,
        is_cover: img.is_cover,
        image_url: addSupabaseUrl(img.image_url, TOURS_BUCKET),
    }));

    let hasReviewed = false;
    if (user_id && !isNaN(user_id)) {
        const existingReview = await Review.findOne({
            where: {
                tour_id: id,
                user_id,
            },
        });
        hasReviewed = !!existingReview;
    }

    res.json({
        tour_id: plainTour.tour_id,
        name: plainTour.name,
        description: plainTour.description,
        price: Number(plainTour.price),
        start_date: formatDate(plainTour.start_date),
        end_date: formatDate(plainTour.end_date),
        available_spots: plainTour.available_spots,
        category_id: plainTour.Category?.category_id ?? null,
        category_name: plainTour.Category?.name ?? null,
        destination_id: plainTour.Destination?.destination_id ?? null,
        destination_name: plainTour.Destination?.name ?? null,
        images,
        hasReviewed,
    });
};

// Update Tour (Admin only)
export const updateTour = async (
    req: AuthenticatedRequest<TourParams, any, UpdateTourBody>,
    res: Response
): Promise<void> => {
    const id = Number(req.params.id);
    const {
        name,
        description,
        price,
        available_spots,
        start_date,
        end_date,
        category_id,
        destination_id,
    } = req.body;

    const tour = await Tour.findByPk(id);
    if (!tour) {
        throw new NotFoundError('Tour not found.');
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    await tour.update({
        name,
        description,
        price,
        available_spots,
        start_date: startDate,
        end_date: endDate,
        category_id,
        destination_id,
    });

    res.json(tour);
};

// Delete Tour (Admin only)
export const deleteTour = async (
    req: AuthenticatedRequest<TourParams>,
    res: Response
): Promise<void> => {
    const id = req.params.id;

    const tour = await Tour.findByPk(id, {
        include: [{ model: TourImage, as: 'TourImages' }],
    });

    if (!tour) {
        throw new NotFoundError('Tour not found.');
    }

    if (tour.TourImages && tour.TourImages.length > 0) {
        for (const image of tour.TourImages) {
            if (image.image_url) {
                await deleteFromSupabase(image.image_url, TOURS_BUCKET);
            }
        }

        await TourImage.destroy({ where: { tour_id: id } });
    }

    await tour.destroy();

    res.json({ message: 'Tour deleted successfully.' });
};
