import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';
import toast from 'react-hot-toast';

type ApiProduct = Product & {
  featured?: boolean;
  isFeatured?: boolean;
  reviews?: number;
  ratingsCount?: number;
  ratingsAvg?: number;
  createdAt?: string;
  isActive?: boolean;
  main_image?: string;
  images?: string[];
};

function normalizeProduct(product: ApiProduct): Product {
  const categoryName = typeof product.category === 'string' ? product.category : (product.categories?.name || product.category || '');
  const stockQuantity =
    product.stock_quantity ??
    product.stockQuantity ??
    product.stock ??
    (product.inStock ? 1 : 0);

  return {
    ...product,
    category: categoryName || '',
    categories: product.categories || (categoryName ? { name: categoryName } : undefined),
    image_url: product.image_url || product.main_image || product.image || product.thumbnail_url,
    thumbnail_url:
      product.thumbnail_url ||
      product.main_image ||
      product.image_url ||
      product.image ||
      product.product_images?.[0]?.image_url ||
      product.images?.[0],
    is_featured: product.is_featured ?? product.featured ?? product.isFeatured ?? false,
    reviews_count: product.reviews_count ?? product.reviews ?? product.ratingsCount ?? 0,
    rating: product.rating ?? product.ratingsAvg ?? 0,
    stock_quantity: stockQuantity,
    inStock: product.inStock ?? stockQuantity > 0,
    is_active: product.is_active ?? product.isActive ?? true,
    created_at: product.created_at ?? product.createdAt,
  };
}

function normalizeProducts(products: ApiProduct[] = []): Product[] {
  return products.map(normalizeProduct);
}

export function useProducts(options: Record<string, string | number | boolean> = {}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      const query = new URLSearchParams(options as Record<string, string>).toString();
      const data = await api.get(`/api/products?${query}`);
      
      // The current backend returns a raw array, while the previous one returned an object
      if (Array.isArray(data)) {
        return normalizeProducts(data as ApiProduct[]);
      }

      // Fallback for paginated or nested structure
      const shaped = data as {
        success?: boolean;
        data?: ApiProduct[];
        products?: ApiProduct[];
      };

      return normalizeProducts(shaped?.data || shaped?.products || []);
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required');
      const data = await api.get(`/api/products/${slug}`);

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const shaped = data as { success?: boolean; data?: ApiProduct };
        if (shaped.data) return normalizeProduct(shaped.data);
      }

      return normalizeProduct(data as ApiProduct);
    },
    enabled: !!slug,
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const data = await api.get('/api/admin/products');
      return normalizeProducts((data || []) as ApiProduct[]);
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: Partial<Product>) => {
      return await api.post('/api/admin/products', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<Product> }) => {
      return await api.put(`/api/admin/products/${id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/api/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
}
