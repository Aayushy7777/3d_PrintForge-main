const express = require('express');
const { getProducts, getProductById } = require('../controllers/productController');

const router = express.Router();

/**
 * GET /api/products
 * Public route — returns all products from Supabase.
 */
router.get('/', getProducts);

/**
 * GET /api/products/:id
 * Public route — returns a single product by ID.
 */
router.get('/:id', getProductById);

module.exports = router;
