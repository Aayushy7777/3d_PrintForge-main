import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  main_image?: string;
  category: string;
  rating?: number;
  isFeatured?: boolean;
}

const FeaturedCarousel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products?featured=true');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        const productsArray = data.products || data.data || (Array.isArray(data) ? data : []);
        setProducts(productsArray.slice(0, 8)); // Limit to 8 featured products
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Products</h2>
            <p className="text-slate-600">Loading our latest creations...</p>
          </div>
          <div className="flex gap-4 justify-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-64 h-80 bg-slate-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return (
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Products</h2>
          <p className="text-slate-600">{error || 'No featured products available'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Featured Products</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover our curated collection of premium 3D printed products
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Product grid with scroll effect */}
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => {
                const isActive = index === currentIndex;
                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.slug || product.id}`}
                    className={`group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 ${
                      isActive ? 'lg:scale-105 lg:col-span-2' : ''
                    }`}
                  >
                    {/* Product image */}
                    <div className="relative h-64 sm:h-72 bg-slate-100 overflow-hidden">
                      <img
                        src={product.main_image || product.image || '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.isFeatured && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Featured
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div className="flex gap-2 w-full">
                          <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
                            <ShoppingCart className="w-5 h-5" /> Add
                          </button>
                          <button className="bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-lg transition-colors">
                            <Heart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Product info */}
                    <div className="p-4">
                      <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide mb-1">
                        {product.category}
                      </p>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </p>
                          {product.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-yellow-400">★</span>
                              <span className="text-sm text-slate-600">{product.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          {products.length > 4 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-100 text-slate-900 p-3 rounded-full shadow-lg transition-all hover:scale-110 hidden lg:flex items-center justify-center"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-slate-100 text-slate-900 p-3 rounded-full shadow-lg transition-all hover:scale-110 hidden lg:flex items-center justify-center"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* View all button */}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
