import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Loader2, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/utils/formatters';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please log in to proceed with checkout');
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10 inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary/50"
            >
              <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-20" />
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">Your forge is empty</h1>
            <p className="text-muted-foreground mb-10 text-lg">You haven't added any masterpieces to your collection yet. Let's find something incredible.</p>
            <Button asChild size="xl" className="w-full rounded-2xl shadow-xl shadow-primary/20">
              <Link to="/products">Start Exploring</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <main className="pt-24 pb-20">
        <section className="container mx-auto px-4 lg:px-8 py-12">
          <div className="flex items-baseline justify-between mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter italic">The Collection</h1>
            <p className="text-muted-foreground text-sm font-medium">{items.length} unique pieces</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row gap-6 p-6 rounded-[2rem] bg-card border hover:shadow-2xl hover:shadow-primary/5 transition-all group"
                  >
                    <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-secondary/30 flex-shrink-0 border">
                      <img src={item.product?.thumbnail_url || item.product?.image_url || item.product?.image || '/placeholder.png'} alt={item.product?.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-grow space-y-2">
                       <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{item.product?.name}</h3>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">{item.product?.categories?.name || 'Custom Piece'}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>
                       
                       <div className="flex items-center justify-between pt-4">
                          <div className="flex items-center bg-secondary/50 rounded-xl p-1 h-10">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-xs" 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-10 text-center font-bold">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-xs" 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xl font-bold text-primary">{formatCurrency((item.product?.price || 0) * item.quantity)}</p>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* <div className="mt-8 flex justify-center">
                 <Button variant="outline" onClick={clearCart} className="text-muted-foreground hover:text-destructive rounded-xl border-dashed">
                    Dissolve All Pieces
                 </Button>
              </div> */}
            </div>

            <div className="lg:col-span-4">
              <div className="p-8 rounded-[2.5rem] bg-secondary/20 border-2 border-primary/5 sticky top-28 space-y-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold italic border-b pb-4">Master Order</h2>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground italic">Batch Total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground italic">Forge Delivery</span>
                    <span className="text-green-600">FREE (Standard)</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground italic">Tax Calculation</span>
                    <span>included</span>
                  </div>
                  
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mt-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold">Total Pay</span>
                      <span className="text-3xl font-bold text-primary tracking-tighter">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    size="xl"
                    className="w-full h-16 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/20 group"
                    onClick={handleCheckout}
                    disabled={authLoading}
                  >
                    Forge Order <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                    <ShieldCheck className="h-3 w-3" /> Secure Payment via Razorpay
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                   <div className="flex items-start gap-4 p-4 bg-background/50 rounded-2xl border">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-bold text-xs uppercase tracking-tight">Delivery Node</p>
                        <p className="text-muted-foreground text-[10px] italic">Set your destination in the next step.</p>
                      </div>
                   </div>
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
