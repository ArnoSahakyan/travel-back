import { Request, Response } from 'express';
import {Op, Sequelize, WhereOptions} from 'sequelize';
import { addSupabaseUrl, deleteFromSupabase, uploadAndProcessImages } from '../utils';
import { DESTINATIONS_BUCKET } from '../constants';
import { Destination } from '../db/models';
import {AuthenticatedRequest, IPaginationQuery, TypedRequest} from '../types';

interface DestinationCreateBody {
    name: string;
    description?: string;
}

interface GetFilteredTDestinationsQuery extends IPaginationQuery {
    search?: string;
}

interface DestinationUpdateBody {
    name?: string;
    description?: string;
}

interface DestinationParams {
    id: number;
}

// Create Destination (Admin only)
export const createDestination = async (
    req: AuthenticatedRequest<{}, {}, DestinationCreateBody>,
    res: Response
) => {
    const { name, description } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    try {
        let imagePath: string | undefined;

        if (files) {
            const uploaded = await uploadAndProcessImages(files, DESTINATIONS_BUCKET, name.replace(/\s+/g, '_'));
            imagePath = uploaded[0];
        }

        const destination = await Destination.create({
            name,
            description,
            image: imagePath,
        });

        res.status(201).json(destination);
    } catch (error) {
        console.error('Create Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Update Destination (Admin only)
export const updateDestination = async (
    req: AuthenticatedRequest<DestinationParams, {}, DestinationUpdateBody>,
    res: Response
) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found.' });
        }

        let imagePath = destination.image;

        if (files) {
            if (imagePath) {
                await deleteFromSupabase(imagePath, DESTINATIONS_BUCKET);
            }

            const uploaded = await uploadAndProcessImages(files, DESTINATIONS_BUCKET, id);
            imagePath = uploaded[0];
        }

        await destination.update({
            name,
            description,
            image: imagePath,
        });

        res.json(destination);
    } catch (error) {
        console.error('Update Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get All Destinations
export const getAllDestinations = async (
    req: TypedRequest<{}, {}, {}, GetFilteredTDestinationsQuery>,
    res: Response
) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        const baseCondition: WhereOptions = {};

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

        const { count, rows } = await Destination.findAndCountAll({
            where: whereCondition,
            limit,
            offset,
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
              SELECT COUNT(*)
              FROM "tours" AS "Tour"
              WHERE "Tour"."destination_id" = "Destination"."destination_id"
            )`),
                        'tourCount',
                    ],
                    [
                        Sequelize.literal(`(
              SELECT MIN("Tour"."price")
              FROM "tours" AS "Tour"
              WHERE "Tour"."destination_id" = "Destination"."destination_id"
            )`),
                        'startingPrice',
                    ],
                ],
            },
            order: [['destination_id', 'ASC']],
        });

        const destinations = rows.map(destination => {
            const raw = destination.get({ plain: true }) as any;
            return {
                ...raw,
                image: addSupabaseUrl(raw.image ?? '', DESTINATIONS_BUCKET),
            };
        });

        res.json({
            total: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            destinations,
        });
    } catch (error) {
        console.error('Get All Destinations Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get One
export const getDestinationById = async (
    req: Request<DestinationParams>,
    res: Response
) => {
    const { id } = req.params;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found.' });
        }

        const plainDestination = destination.get({ plain: true }) as any;

        res.json({
            ...plainDestination,
            image: addSupabaseUrl(plainDestination.image ?? '', DESTINATIONS_BUCKET),
        });
    } catch (error) {
        console.error('Get Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Delete
export const deleteDestination = async (
    req: AuthenticatedRequest<DestinationParams>,
    res: Response
) => {
    const { id } = req.params;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found.' });
        }

        if (destination.image) {
            await deleteFromSupabase(destination.image, DESTINATIONS_BUCKET);
        }

        await destination.destroy();

        res.json({ message: 'Destination deleted successfully.' });
    } catch (error) {
        console.error('Delete Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
