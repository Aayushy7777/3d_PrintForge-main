import { Separator } from "@/components/ui/separator";

import { CartItem } from "@/contexts/CartContext";

interface OrderSummaryProps {
  items: CartItem[];
}

export function OrderSummary({ items }: OrderSummaryProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded border bg-secondary/30 overflow-hidden flex-shrink-0">
              <img 
                src={item.product?.thumbnail_url || item.product?.image_url || item.product?.image || '/placeholder.png'} 
                alt={item.product?.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium line-clamp-1">{item.product?.name}</p>
              <p className="text-muted-foreground italic text-xs">Qty: {item.quantity}</p>
            </div>
          </div>
          <p className="font-semibold">₹{(item.product?.price * item.quantity).toLocaleString()}</p>
        </div>
      ))}
      <Separator />
    </div>
  );
}
