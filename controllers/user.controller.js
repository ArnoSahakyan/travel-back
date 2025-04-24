import models from "../models/index.js";

const { User, Role } = models;

// Get all users
export async function getAllUsers(req, res) {
    try {
        const users = await User.findAll({ include: [{ model: Role }] });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

// Get a single user by ID
export async function getUserById(req, res) {
    try {
        const user = await User.findByPk(req.params.id, { include: [{ model: Role }] });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}

// Create a new user
export async function createUser(req, res) {
    try {
        const { full_name, email, password_hash, phone, role_id } = req.body;
        const newUser = await User.create({ full_name, email, password_hash, phone, role_id });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create user' });
    }
}

// Update a user
export async function updateUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await user.update(req.body);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
}

// Delete a user
export async function deleteUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await user.destroy();
        res.status(204).json();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
}
