import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping duration-1000" />
        <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-primary-foreground" />
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
        Thank you for your purchase. Your order <span className="text-foreground font-mono font-bold">#{orderId?.slice(0, 8)}</span> has been placed successfully.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        <Button size="lg" className="h-16 text-lg" asChild>
          <Link to="/order-history">
            <Package className="mr-2 h-5 w-5" /> View Orders <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" className="h-16 text-lg" asChild>
          <Link to="/">
            <Home className="mr-2 h-5 w-5" /> Back to Home
          </Link>
        </Button>
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        We've sent a confirmation email to your registered address.
      </p>
    </div>
  );
}
