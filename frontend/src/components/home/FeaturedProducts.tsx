import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomPrintCard } from '@/components/products/CustomPrintCard';

export default function FeaturedProducts() {
  const { data: products = [], isLoading } = useProducts();

  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 3);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-accent font-medium uppercase tracking-[0.2em] text-sm"
          >
            Our Collection
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-medium text-foreground mt-4"
          >
            Featured Products
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-4 max-w-2xl mx-auto"
          >
            Discover our most popular 3D printed creations, crafted with precision and care.
          </motion.p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))
            : (
                <>
                  {featuredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={`/products/${product.id}`} className="group block">
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border mb-4 hover-lift">
                          <img
                            src={product.thumbnail_url || product.image_url || product.image || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Quick view overlay */}
                          <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                            <Button variant="glass" size="sm">
                              Quick View
                            </Button>
                          </div>

                          {/* Category badge */}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-background/90 backdrop-blur-sm border border-border">
                              {product.category}
                            </span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-accent text-accent" />
                              <span className="text-sm font-medium text-foreground">
                                {product.rating ?? 0}
                              </span>
                            </div>
                            <span className="text-muted-foreground text-sm">
                              ({product.reviews_count ?? 0} reviews)
                            </span>
                          </div>
                          <h3 className="font-display font-medium text-lg text-foreground group-hover:text-accent transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xl font-semibold text-foreground">
                              ${product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              In Stock
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  <CustomPrintCard viewMode="grid" index={3} />
                </>
              )}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/products">
            <Button variant="outline" size="lg" className="group">
              View All Products
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}