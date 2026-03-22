import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Plus, 
  Minus, 
  Heart, 
  Share2, 
  Info,
  ChevronLeft,
  Box
} from 'lucide-react';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { Product, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating } from '@/components/product/StarRating';
import { ReviewCard } from '@/components/product/ReviewCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/utils/formatters';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState('PLA');
  const [selectedQuality, setSelectedQuality] = useState('Standard');

  const { data: product, isLoading, isError } = useProduct(slug!);

  const { data: relatedProducts = [] } = useProducts({ 
    category: product?.categories?.name, 
    limit: 4 
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !product) return <ErrorState />;

  const images = [product.thumbnail_url || product.image_url || product.image, ...(product.product_images?.map((img: { image_url: string }) => img.image_url) || [])].filter(Boolean);

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${quantity} ${product.name} to cart`, {
        icon: '🚀',
        style: {
          borderRadius: '1rem',
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add item to cart';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <nav className="container mx-auto px-4 lg:px-8 py-6 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Forge</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-primary transition-colors">Catalog</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <section className="container mx-auto px-4 lg:px-8 py-8">
          <div className="grid lg:grid-cols-11 gap-12 lg:gap-16 items-start">
            {/* Image Section */}
            <div className="lg:col-span-6 space-y-6">
              <motion.div 
                layoutId={`image-${product.id}`}
                className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-secondary/30 border shadow-2xl shadow-primary/5"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={images[activeImage] || '/placeholder.png'}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full h-full object-cover select-none"
                  />
                </AnimatePresence>
                
                {product.is_featured && (
                  <Badge className="absolute top-6 left-6 bg-primary px-4 py-1 text-sm">
                    Premium Batch
                  </Badge>
                )}
              </motion.div>

              <div className="grid grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === i 
                        ? "border-primary scale-105 shadow-xl ring-4 ring-primary/10" 
                        : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Section */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                  {product.categories?.name}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight italic">{product.name}</h1>
                <div className="flex items-center gap-4">
                  <StarRating rating={product.rating || 4.5} size="sm" />
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    {product.reviews_count || 12} Assessments
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-4xl font-bold tracking-tighter text-primary">
                  {formatCurrency(product.price)}
                </p>
                {product.compare_at_price && (
                  <p className="text-lg text-muted-foreground line-through decoration-primary/40">
                    {formatCurrency(product.compare_at_price)}
                  </p>
                )}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed italic">
                {product.description}
              </p>

              <Separator className="bg-border/50" />

              {/* Selection Options */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Material Selection</p>
                  <div className="flex flex-wrap gap-2">
                    {['PLA', 'PETG', 'ABS', 'Resin'].map((material) => (
                      <button
                        key={material}
                        onClick={() => setSelectedMaterial(material)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                          selectedMaterial === material
                            ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                            : "bg-secondary/50 text-muted-foreground border-transparent hover:border-primary/20"
                        }`}
                      >
                        {material}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Forge Quality</p>
                  <div className="flex flex-wrap gap-2">
                    {['Standard', 'Fine', 'Ultra High'].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setSelectedQuality(quality)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                          selectedQuality === quality
                            ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                            : "bg-secondary/50 text-muted-foreground border-transparent hover:border-primary/20"
                        }`}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex items-center h-14 px-4 rounded-2xl bg-secondary/50 border border-border/50">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-background"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-background"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  className="flex-grow h-14 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/20 group"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                  Add to Collection
                </Button>
                
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-2 hover:bg-primary/5 hover:text-primary">
                  <Heart className="h-6 w-6" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/30 border border-white/5">
                  <Truck className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-bold text-xs uppercase">Express Transit</p>
                    <p className="text-[10px] text-muted-foreground">3-5 forge days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/30 border border-white/5">
                  <ShieldCheck className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-bold text-xs uppercase">Lifetime Bond</p>
                    <p className="text-[10px] text-muted-foreground">Warranty included</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Details & Reviews Tabs */}
        <section className="container mx-auto px-4 lg:px-8 py-20">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="bg-secondary/30 w-full justify-start p-1 rounded-2xl mb-12">
              <TabsTrigger value="details" className="rounded-xl px-8 py-3 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold uppercase tracking-widest text-xs">Technical Specs</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-xl px-8 py-3 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold uppercase tracking-widest text-xs">Master Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold flex items-center gap-3 italic">
                    <Box className="h-6 w-6 text-primary" /> Fabrication Details
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Every piece is crafted using industrial-grade additive manufacturing processes. 
                    We ensure structural integrity and aesthetic precision in every layer.
                  </p>
                  <ul className="space-y-4">
                    {[
                      { label: 'Layer Height', value: '0.1mm - 0.2mm' },
                      { label: 'Infill Density', value: '20% - 100%' },
                      { label: 'Lead Time', value: '48 - 72 Hours' },
                      { label: 'Post-Processing', value: 'Chemical smoothing available' }
                    ].map((spec) => (
                      <li key={spec.label} className="flex justify-between p-4 rounded-xl bg-secondary/20 border">
                        <span className="font-bold text-sm uppercase tracking-tighter text-muted-foreground">{spec.label}</span>
                        <span className="font-medium">{spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[2rem] overflow-hidden bg-secondary border group relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60 z-10" />
                   <img src={images[0]} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0 group-hover:scale-105 duration-700" alt="product preview" />
                   <div className="absolute bottom-10 left-10 z-20">
                      <p className="text-3xl font-bold tracking-tighter text-white italic">Industrial Grade Precision</p>
                   </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                 <div className="w-full md:w-80 p-8 rounded-[2rem] bg-secondary/30 border space-y-6 text-center">
                    <h3 className="text-xl font-bold italic">Forge Rating</h3>
                    <p className="text-6xl font-bold tracking-tighter text-primary">{product.rating || 4.5}</p>
                    <StarRating rating={product.rating || 4.5} justify="center" />
                    <p className="text-sm text-muted-foreground font-medium italic">Based on {product.reviews_count || 12} successful fabrications</p>
                    <Button className="w-full rounded-xl">Review this Piece</Button>
                 </div>
                 
                 <div className="flex-grow space-y-6">
                    {product.reviews?.length > 0 ? (
                      product.reviews.map((review: Review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))
                    ) : (
                      <div className="py-20 text-center bg-secondary/20 rounded-[2rem] border border-dashed border-primary/20">
                         <Star className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                         <p className="text-muted-foreground italic font-medium">This masterpiece is yet to be critiqued.</p>
                      </div>
                    )}
                 </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="container mx-auto px-4 lg:px-8 py-20 border-t">
            <div className="flex items-baseline justify-between mb-12">
              <h2 className="text-4xl font-bold italic tracking-tighter">Related Creations</h2>
              <Button variant="link" asChild className="group">
                <Link to="/products" className="flex items-center gap-2">
                  Explore Full Catalog <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.filter((p: Product) => p.id !== product.id).slice(0, 4).map((rp: Product) => (
                <div key={rp.id} className="group relative">
                  <div className="aspect-square rounded-[2rem] overflow-hidden bg-secondary mb-4 border">
                    <img 
                      src={rp.thumbnail_url || rp.image_url || rp.image || '/placeholder.png'} 
                      alt={rp.name} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                       <Button size="icon" variant="glass" className="rounded-full" onClick={() => navigate(`/products/${rp.slug}`)}>
                          <ChevronRight className="h-5 w-5" />
                       </Button>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg mb-1 truncate">{rp.name}</h4>
                  <p className="text-primary font-bold">{formatCurrency(rp.price)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 container mx-auto px-4 lg:px-8 space-y-12">
        <Skeleton className="h-4 w-48 rounded" />
        <div className="grid lg:grid-cols-11 gap-16">
          <div className="lg:col-span-6 space-y-6">
            <Skeleton className="aspect-square rounded-[2.5rem]" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-16 w-3/4 rounded-xl" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-12 w-48 rounded-xl" />
            <div className="flex gap-4">
               <Skeleton className="h-14 w-24 rounded-2xl" />
               <Skeleton className="h-14 flex-grow rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
           <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <Info className="h-12 w-12 text-destructive" />
           </div>
           <h1 className="text-4xl font-bold tracking-tight">Piece Not Found</h1>
           <p className="text-muted-foreground text-lg">The item you're looking for has dissolved or never existed. Let's find you something else.</p>
           <Button size="lg" className="rounded-2xl w-full" asChild>
              <Link to="/products">Back to Catalog</Link>
           </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
