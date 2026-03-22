import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Grid, List, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: products = [], isLoading, isError, error } = useProducts({
    category: selectedCategory !== 'All' ? selectedCategory : '', 
    sort: sortBy 
  });

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      
      <main className="pt-20">
        {/* Modern Hero Section with Gradient */}
        <section className="relative overflow-hidden py-24 bg-secondary/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container relative mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <Badge variant="outline" className="mb-4 border-primary/20 text-primary">Catalog</Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Forge Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">Imagination</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Browse our curated collection of high-precision 3D prints, 
                from industrial prototypes to exquisite artistic pieces.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Dynamic Toolbar */}
        <section className="sticky top-[72px] z-30 border-b bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search the forge..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                </div>
                <Button variant="outline" size="icon" className="md:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] h-11 border-none bg-secondary/50">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popularity</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className={viewMode === 'grid' ? "shadow-sm bg-background" : ""}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    className={viewMode === 'list' ? "shadow-sm bg-background" : ""}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 container mx-auto px-4 lg:px-8">
          <div className="flex gap-10">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 space-y-8 flex-shrink-0">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Categories</h4>
                <div className="space-y-1">
                  {['All', 'Decorative', 'Functional', 'Miniatures', 'Jewelry'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCategory === cat 
                          ? "bg-primary text-primary-foreground font-medium" 
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <h4 className="font-bold text-sm mb-2">Need a custom print?</h4>
                <p className="text-xs text-muted-foreground mb-4">Upload your STL file and get an instant quote for your unique design.</p>
                <Button size="sm" variant="default" className="w-full" asChild>
                  <Link to="/custom-print">Upload Model</Link>
                </Button>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold italic">
                  {selectedCategory === 'All' ? 'Complete Collection' : selectedCategory}
                  <span className="ml-2 text-sm font-normal text-muted-foreground not-italic">({filteredProducts.length} results)</span>
                </h3>
              </div>

              {isError && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
                  <p className="text-destructive font-semibold mb-2">The forge is cooling down!</p>
                  <p className="text-sm text-muted-foreground mb-4">{(error as Error)?.message || 'We encountered an error loading products.'}</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
                </div>
              )}

              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4 animate-pulse">
                      <div className="aspect-square rounded-2xl bg-secondary/50" />
                      <div className="h-4 w-1/3 bg-secondary/50 rounded" />
                      <div className="h-6 w-2/3 bg-secondary/50 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredProducts.length > 0 ? (
                    <div className={viewMode === 'grid' 
                      ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-8" 
                      : "space-y-6"
                    }>
                      {filteredProducts.map((product: Product, idx) => (
                        <motion.div
                          layout
                          key={product.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                        <Search className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">No masterworks found</h3>
                      <p className="text-muted-foreground max-w-sm">We couldn't find any products matching your specific filters. Try widening your search.</p>
                      <Button variant="link" onClick={() => setSelectedCategory('All')} className="mt-4">
                        View all products
                      </Button>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter/Footer CTA */}
        <section className="container mx-auto px-4 lg:px-8 py-20">
          <div className="bg-primary rounded-[2.5rem] p-12 md:p-20 text-primary-foreground relative overflow-hidden text-center md:text-left">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 italic tracking-tight">Stay Ahead of the Forge</h2>
                <p className="text-primary-foreground/80 text-lg mb-8">Join our elite community circle for early access to new collections and exclusive printing tips.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="Enter your email" 
                    className="h-14 bg-primary-foreground/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl" 
                  />
                  <Button className="h-14 px-8 bg-white text-primary hover:bg-white/90 rounded-2xl font-bold">Join Now</Button>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                 <div className="p-8 rounded-full border border-white/20 animate-pulse">
                    <ShoppingCart className="w-32 h-32 opacity-20" />
                 </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
