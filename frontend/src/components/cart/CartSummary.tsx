import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  onCheckout?: () => void;
  isLoading?: boolean;
}

export function CartSummary({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  onCheckout,
  isLoading
}: CartSummaryProps) {
  const total = subtotal + shipping + tax - discount;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? "Free" : `₹${shipping.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (GST)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>Discount</span>
              <span>-₹{discount.toLocaleString()}</span>
            </div>
          )}
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold pt-2">
          <span>Total</span>
          <span className="text-primary">₹{total.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter>
        {onCheckout && (
          <Button 
            className="w-full py-6 text-lg" 
            onClick={onCheckout}
            disabled={isLoading || subtotal === 0}
          >
            {isLoading ? "Processing..." : "Proceed to Checkout"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
