import {createUser, deleteUser, getAllUsers, getUserById, updateUser} from "../controllers/user.controller.js";
import express from "express";

const router = express.Router();

// Get all users
router.get('/', getAllUsers);

// Get a specific user by ID
router.get('/:id', getUserById);

// Create a new user
router.post('/', createUser);

// Update an existing user
router.put('/:id', updateUser);

// Delete a user
router.delete('/:id', deleteUser);

export default router;
