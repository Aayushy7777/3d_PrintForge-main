import express from 'express';
import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// GET /api/products
// Query params: search, category (slug), sort, min_price, max_price, page, limit, featured
router.get('/', async (req, res, next) => {
  try {
    const { 
      search, 
      category, 
      sort = 'newest', 
      min_price, 
      max_price, 
      page = 1, 
      limit = 12, 
      featured 
    } = req.query;

    let query = supabase
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' });

    // Full-text search (if search query exists)
    if (search) {
      query = query.textSearch('fts', search);
    }

    // Filters
    if (category) {
      query = query.eq('categories.slug', category);
    }
    if (min_price) {
      query = query.gte('price', min_price);
    }
    if (max_price) {
      query = query.lte('price', max_price);
    }
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
    // Always filter for active products unless admin (handled separately if needed)
    query = query.eq('is_active', true);

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: products, count, error } = await query;

    if (error) return next(new AppError(error.message, 500));

    res.json({
      products,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(*), reviews(*)')
      .eq('slug', req.params.slug)
      .eq('is_active', true)
      .single();

    if (error) return next(new AppError('Product not found or database error', 404));

    res.json(product);
  } catch (error) {
    next(error);
  }
});

export default router;
