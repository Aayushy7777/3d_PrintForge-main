const userService = require('../services/userService');
const { validationResult } = require('express-validator');

/**
 * User Controller
 * ----------------
 * Handles HTTP logic for all /api/users routes.
 * All endpoints are protected by supabaseAuthMiddleware.
 * req.user is populated by the middleware with { uid, email }.
 */

/**
 * GET /api/users/profile
 * Returns the authenticated user's own profile.
 * Auto-creates the profile in Supabase on first visit.
 */
const getMyProfile = async (req, res, next) => {
  try {
    const { uid, email } = req.user;

    // Upsert ensures a Supabase record exists for this authenticated user
    const user = await userService.upsertUser({ uid, email });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users
 * Returns all users from the database.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Returns a specific user by their Supabase UID (UUID).
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Updates a user's profile fields (name, etc).
 * A user can only update their own profile.
 */
const updateUser = async (req, res, next) => {
  // Prevent users from updating someone else's profile
  if (req.params.id !== req.user.uid) {
    return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
  }

  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    const updated = await userService.updateUser(req.params.id, { name });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Deletes a user record from Supabase.
 * A user can only delete their own account.
 */
const deleteUser = async (req, res, next) => {
  if (req.params.id !== req.user.uid) {
    return res.status(403).json({ message: 'Forbidden: You can only delete your own account.' });
  }

  try {
    const result = await userService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, getAllUsers, getUserById, updateUser, deleteUser };
