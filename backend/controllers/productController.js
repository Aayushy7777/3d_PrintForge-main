const supabase = require('../config/supabaseClient');

/**
 * Product Controller
 * -------------------
 * Handles HTTP logic for /api/products routes.
 * GET routes are public (no auth required).
 */

/**
 * GET /api/products
 * Returns all products from Supabase.
 */
const getProducts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Returns a single product by its ID.
 */
const getProductById = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    // Some parts of the frontend use `slug` in the URL while older endpoints use `id`.
    // To keep backward compatibility, try ID first then fall back to slug.
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', identifier)
      .single();

    if (!error && data) {
      return res.status(200).json(data);
    }

    const { data: bySlug, error: slugError } = await supabase
      .from('products')
      .select('*')
      .eq('slug', identifier)
      .single();

    if (slugError || !bySlug) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(bySlug);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById };
