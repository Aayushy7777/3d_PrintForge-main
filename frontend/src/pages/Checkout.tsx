import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { api } from "@/lib/api";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { PaymentSection } from "@/components/checkout/PaymentSection";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

const STEPS = ["Address", "Payment", "Review"];

export default function Checkout() {
  const { items, totalPrice, clearLocalCart } = useCart();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      navigate('/products');
    }
  }, [items, navigate, isProcessing]);

  const handleNext = () => {
    if (currentStep === 0 && !selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      // 1. Create order on backend
      const { order } = await api.post<{ order: { id: string } }>('/api/orders', {
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        delivery_address_id: selectedAddressId,
        payment_method: paymentMethod
      });

      if (paymentMethod === 'online') {
        // 2. Create Razorpay payment link and redirect directly
        const { payment_link } = await api.post<{ payment_link: string }>('/api/payments/create-link', {
          order_id: order.id
        });

        if (!payment_link) {
          throw new Error('Unable to create payment link');
        }

        window.location.href = payment_link;
        return;
      } else {
        // Cash on delivery
        toast.success("Order placed successfully!");
        clearLocalCart();
        navigate(`/order-confirmation?orderId=${order.id}`);
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/10 pb-20 pt-10 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
          <p className="text-muted-foreground">Secure your order in a few steps</p>
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 0 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 text-sm">1</span>
                  Select Delivery Address
                </h2>
                <AddressSelector 
                  onSelect={setSelectedAddressId} 
                  selectedId={selectedAddressId} 
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 text-sm">2</span>
                  Payment Method
                </h2>
                <PaymentSection 
                  selectedMethod={paymentMethod} 
                  onSelect={setPaymentMethod} 
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 text-sm">3</span>
                  Review Your Order
                </h2>
                <div className="bg-background rounded-xl p-6 border shadow-sm">
                  <OrderSummary items={items} />
                  <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-dashed flex items-center">
                    <ShieldCheck className="h-5 w-5 text-primary mr-3" />
                    <p className="text-sm">Your order is protected by our buyer protection policy.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {currentStep > 0 ? (
                <Button variant="ghost" onClick={handleBack} disabled={isProcessing}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : (
                <div />
              )}
              
              {currentStep < STEPS.length - 1 ? (
                <Button onClick={handleNext} className="px-8">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handlePlaceOrder} 
                  className="px-8" 
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Place Order ₹${totalPrice}`}
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <CartSummary 
              subtotal={totalPrice} 
              shipping={totalPrice >= 500 ? 0 : 49}
              tax={totalPrice * 0.18}
              isLoading={isProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
