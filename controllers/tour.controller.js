import db from '../models/index.js';
import {addSupabaseUrl, deleteFromSupabase, uploadAndProcessImages} from '../utils/index.js';
import {TOURS_BUCKET} from "../constants/index.js";

const { Tour, TourImage } = db;

// Create Tour (Admin only)
export const createTour = async (req, res) => {
    const { name, description, price, available_spots, start_date, end_date, category_id, destination_id } = req.body;
    const files = req.files;
    try {
        const tour = await Tour.create({
            name,
            description,
            price,
            available_spots,
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

// Get Tours with Optional Filters (category_id, destination_id, pagination)
export const getFilteredTours = async (req, res) => {
    const { category_id, destination_id } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (category_id) where.category_id = category_id;
    if (destination_id) where.destination_id = destination_id;

    try {
        const { count, rows } = await Tour.findAndCountAll({
            where,
            limit,
            offset,
            include: [
                {
                    model: db.TourImage,
                    as: 'TourImages',
                    where: { is_cover: true },
                    required: false,
                    attributes: ['image_url'],
                },
            ],
        });

        const tours = rows.map((tour) => {
            const tourJson = tour.toJSON();
            return {
                ...tourJson,
                image: addSupabaseUrl(tourJson.TourImages?.[0]?.image_url, TOURS_BUCKET) || null,
                TourImages: undefined,
            };
        });

        res.json({
            total: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            tours,
        });
    } catch (error) {
        console.error('Get Filtered Tours Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get a single Tour by ID (Public)
export const getTourById = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;

    try {
        const tour = await Tour.findByPk(id, {
            include: [
                { model: db.TourImage, as: 'TourImages' },
                { model: db.Destination, as: 'Destination' },
                { model: db.TourCategory, as: 'TourCategory' },
            ],
        });

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found.' });
        }

        const plainTour = tour.get({ plain: true });

        const images = plainTour.TourImages.map((img) => ({
            image_id: img.image_id,
            is_cover: img.is_cover,
            image_url: addSupabaseUrl(img.image_url, TOURS_BUCKET),
        }));

        let hasReviewed = false;
        if (user_id) {
            const existingReview = await db.Review.findOne({
                where: {
                    tour_id: id,
                    user_id: user_id,
                },
            });
            hasReviewed = !!existingReview;
        }

        const response = {
            tour_id: plainTour.tour_id,
            name: plainTour.name,
            description: plainTour.description,
            price: plainTour.price,
            start_date: plainTour.start_date,
            end_date: plainTour.end_date,
            available_spots: plainTour.available_spots,

            category_name: plainTour.TourCategory?.name ?? null,
            destination_name: plainTour.Destination?.name ?? null,

            images,
            hasReviewed,
        };

        res.json(response);
    } catch (error) {
        console.error('Get Tour Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Update Tour by ID (Admin only)
export const updateTour = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, available_spots, start_date, end_date, category_id, destination_id } = req.body;

    try {
        const tour = await Tour.findByPk(id);

        if (!tour) {
            return res.status(404).json({ message: 'Tour not found.' });
        }

        await tour.update({
            name,
            description,
            price,
            available_spots,
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
