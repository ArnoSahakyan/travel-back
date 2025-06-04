import {addSupabaseUrl, deleteFromSupabase, uploadAndProcessImages} from '../utils';
import {Sequelize} from "sequelize";
import {DESTINATIONS_BUCKET} from "../constants";
import {Destination} from "../db/models";
import {AuthenticatedRequest} from "../types";
import { Request, Response } from 'express';

// Create Destination (Admin only)
export const createDestination = async (req: AuthenticatedRequest, res: Response) => {
    const {name, description} = req.body;
    const file = req.files;

    try {
        let imagePath;

        if (file) {
            const uploaded = await uploadAndProcessImages(file, DESTINATIONS_BUCKET, name.replace(/\s+/g, '_'));
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
        res.status(500).json({message: 'Internal server error.'});
    }
};

// Update Destination (Admin only)
export const updateDestination = async (req: AuthenticatedRequest, res: Response) => {
    const {id} = req.params;
    const {name, description} = req.body;
    const file = req.files;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            res.status(404).json({message: 'Destination not found.'});
            return;
        }

        let imagePath = destination.image;

        if (file) {
            // Delete the old image if it exists
            if (imagePath) {
                await deleteFromSupabase(imagePath, DESTINATIONS_BUCKET);
            }

            const uploaded = await uploadAndProcessImages(file, DESTINATIONS_BUCKET, id);
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
        res.status(500).json({message: 'Internal server error.'});
    }
};

export const getAllDestinations = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const {count, rows} = await Destination.findAndCountAll({
            limit,
            offset,
            attributes: {
                include: [
                    // Count number of tours
                    [
                        Sequelize.literal(`(
                          SELECT COUNT(*)
                          FROM "tours" AS "Tour"
                          WHERE "Tour"."destination_id" = "Destination"."destination_id"
                        )`),
                        'tourCount',
                    ],
                    // Minimum tour price (starting price)
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
            const raw = destination.get({ plain: true });
            return {
                ...raw,
                image: addSupabaseUrl(raw.image, DESTINATIONS_BUCKET),
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
        res.status(500).json({message: 'Internal server error.'});
    }
};

export const getDestinationById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            res.status(404).json({ message: 'Destination not found.' });
            return;
        }

        const plainDestination = destination.get({ plain: true });

        res.json({
            ...plainDestination,
            image: addSupabaseUrl(plainDestination.image, DESTINATIONS_BUCKET),
        });
    } catch (error) {
        console.error('Get Destination Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const deleteDestination = async (req: AuthenticatedRequest, res: Response) => {
    const {id} = req.params;

    try {
        const destination = await Destination.findByPk(id);

        if (!destination) {
            res.status(404).json({message: 'Destination not found.'});
            return;
        }

        // Delete image from Supabase if exists
        if (destination.image) {
            await deleteFromSupabase(destination.image, DESTINATIONS_BUCKET);
        }

        await destination.destroy();

        res.json({message: 'Destination deleted successfully.'});
    } catch (error) {
        console.error('Delete Destination Error:', error);
        res.status(500).json({message: 'Internal server error.'});
    }
};
