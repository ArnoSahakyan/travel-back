import { Response } from 'express';
import { Category } from '../db/models';
import { AuthenticatedRequest, TypedRequest } from '../types';

// --- Types ---
type CategoryParams = { id: number };
type CreateOrUpdateCategoryBody = { name: string };

export const createCategory = async (
    req: AuthenticatedRequest<{}, any, CreateOrUpdateCategoryBody>,
    res: Response
): Promise<void> => {
    const { name } = req.body;

    try {
        const category = await Category.create({ name });
        res.status(201).json(category);
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getAllCategories = async (
    _req: TypedRequest,
    res: Response
): Promise<void> => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        console.error('Get All Categories Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getCategoryById = async (
    req: TypedRequest<CategoryParams>,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            res.status(404).json({ message: 'Category not found.' });
            return;
        }

        res.json(category);
    } catch (error) {
        console.error('Get Category Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateCategory = async (
    req: AuthenticatedRequest<CategoryParams, any, CreateOrUpdateCategoryBody>,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            res.status(404).json({ message: 'Category not found.' });
            return;
        }

        await category.update({ name });
        res.json(category);
    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const deleteCategory = async (
    req: AuthenticatedRequest<CategoryParams>,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);

        if (!category) {
            res.status(404).json({ message: 'Category not found.' });
            return;
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully.' });
    } catch (error) {
        console.error('Delete Category Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
