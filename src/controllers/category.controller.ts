import { Response } from 'express';
import { Category } from '../db/models';
import { AuthenticatedRequest, TypedRequest } from '../types';
import { NotFoundError } from '../utils';

type CategoryParams = { id: number };
type CreateOrUpdateCategoryBody = { name: string };

export const createCategory = async (
    req: AuthenticatedRequest<{}, any, CreateOrUpdateCategoryBody>,
    res: Response
): Promise<void> => {
    const { name } = req.body;
    const category = await Category.create({ name });
    res.status(201).json(category);
};

export const getAllCategories = async (
    _req: TypedRequest,
    res: Response
): Promise<void> => {
    const categories = await Category.findAll();
    res.json(categories);
};

export const getCategoryById = async (
    req: TypedRequest<CategoryParams>,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
        throw new NotFoundError('Category not found.');
    }

    res.json(category);
};

export const updateCategory = async (
    req: AuthenticatedRequest<CategoryParams, any, CreateOrUpdateCategoryBody>,
    res: Response
): Promise<void> => {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
        throw new NotFoundError('Category not found.');
    }

    await category.update({ name });
    res.json(category);
};

export const deleteCategory = async (
    req: AuthenticatedRequest<CategoryParams>,
    res: Response
): Promise<void> => {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
        throw new NotFoundError('Category not found.');
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully.' });
};
