import db from '../models/index.js';
const { TourCategory } = db;

// Create a new Category
export const createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const category = await TourCategory.create({ name });
        res.status(201).json(category);
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get all Categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await TourCategory.findAll();
        res.json(categories);
    } catch (error) {
        console.error('Get All Categories Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get a Category by ID
export const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await TourCategory.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.json(category);
    } catch (error) {
        console.error('Get Category Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Update a Category by ID
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const category = await TourCategory.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        await category.update({ name });

        res.json(category);
    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Delete a Category by ID
export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await TourCategory.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        await category.destroy();

        res.json({ message: 'Category deleted successfully.' });
    } catch (error) {
        console.error('Delete Category Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
