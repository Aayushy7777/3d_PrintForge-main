import express from 'express';
import { ProductRepository } from '../repositories/ProductRepository.js';
import { query, param, body, validationResult } from 'express-validator';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

const mapLegacyProduct = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  price: typeof p.price === 'string' ? Number(p.price) : p.price,
  category: p.category,
  category_id: p.category_id,
  image: p.image,
  images: p.image ? [p.image] : [],
  inStock: p.inStock,
  stockQuantity: p.inStock ? 10 : 0,
  isFeatured: p.featured,
  isActive: true,
  rating: typeof p.rating === 'string' ? Number(p.rating) : p.rating,
  ratingsAvg: typeof p.rating === 'string' ? Number(p.rating) : p.rating,
  ratingsCount: p.reviews,
  materials: p.materials,
  colors: p.colors,
  printTime: p.printTime,
  createdAt: p.created_at,
  updatedAt: p.created_at,
});

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// GET all products with pagination and filters
router.get(
  '/',
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('category').optional().isString(),
  query('search').optional().isString().trim(),
  query('inStock').optional().isBoolean(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filters = {};
      if (req.query.category) filters.categoryId = req.query.category;
      if (req.query.search) filters.search = req.query.search;
      if (req.query.inStock !== undefined) {
        filters.inStock = req.query.inStock === 'true';
      }

      const products = await ProductRepository.getAllProducts(skip, limit, filters);

      res.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total: products.length,
        },
      });
    } catch (error) {
      try {
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;

        const mapped = (data || []).map(mapLegacyProduct);
        res.json({
          success: true,
          data: mapped,
          source: 'supabase-fallback',
        });
      } catch (fallbackError) {
        res.status(500).json({
          success: false,
          message: fallbackError.message,
        });
      }
    }
  }
);

// GET featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await ProductRepository.getFeaturedProducts();
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    try {
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      res.json({
        success: true,
        data: (data || []).map(mapLegacyProduct),
        source: 'supabase-fallback',
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: fallbackError.message,
      });
    }
  }
});

// GET products by category
router.get(
  '/category/:categoryId',
  param('categoryId').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const products = await ProductRepository.getProductsByCategory(
        req.params.categoryId,
        skip,
        limit
      );

      res.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// SEARCH products
router.get(
  '/search',
  query('q').notEmpty().isString().trim(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const products = await ProductRepository.searchProducts(
        req.query.q,
        skip,
        limit
      );

      res.json({
        success: true,
        data: products,
        query: req.query.q,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET single product by slug
router.get(
  '/:slug',
  param('slug').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const product = await ProductRepository.findBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      try {
        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', req.params.slug)
          .maybeSingle();

        if (supabaseError) throw supabaseError;
        if (!data) {
          return res.status(404).json({
            success: false,
            message: 'Product not found',
          });
        }

        res.json({
          success: true,
          data: mapLegacyProduct(data),
          source: 'supabase-fallback',
        });
      } catch (fallbackError) {
        res.status(500).json({
          success: false,
          message: fallbackError.message,
        });
      }
    }
  }
);

// GET product stats (admin only)
router.get('/admin/stats', async (req, res) => {
  try {
    const stats = await ProductRepository.getProductStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST create product (admin only)
router.post(
  '/',
  body('name').notEmpty().isString(),
  body('slug').notEmpty().isString(),
  body('description').notEmpty().isString(),
  body('price').isFloat({ min: 0 }),
  body('costPrice').optional().isFloat({ min: 0 }),
  body('categoryId').notEmpty().isString(),
  body('materials').optional().isArray(),
  body('colors').optional().isArray(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const product = await ProductRepository.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// PUT update product (admin only)
router.put(
  '/:id',
  param('id').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const product = await ProductRepository.updateProduct(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// DELETE product (admin only)
router.delete(
  '/:id',
  param('id').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      await ProductRepository.deleteProduct(req.params.id);
      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;