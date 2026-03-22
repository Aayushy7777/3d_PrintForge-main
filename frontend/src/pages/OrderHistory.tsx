import { useOrders } from "@/hooks/useOrders";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { ShoppingBag, Eye, Package } from "lucide-react";
import { Skeleton } from "@/components/common/Skeleton";

export default function OrderHistory() {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <div className="container mx-auto py-20 px-4 space-y-6">
        <Skeleton className="h-10 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto py-20 px-4">
        <EmptyState 
          title="No orders yet" 
          description="Looks like you haven't placed any orders yet. Start shopping now!"
          icon={ShoppingBag}
          action={{ label: "Browse Products", href: "/products" }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex items-center space-x-3 mb-8">
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Order</span>
                  <span className="font-mono text-sm font-bold">#{order.order_number || order.id.slice(0, 8)}</span>
                </div>
                <p className="text-sm font-medium">Placed on {formatDate(order.created_at)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm text-muted-foreground">Total Amount</span>
                  <span className="text-lg font-bold">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="h-10 w-[1px] bg-border hidden md:block" />
                <div className="flex flex-col items-end">
                  <span className="text-sm text-muted-foreground mb-1">Status</span>
                  <Badge className={
                    order.status === 'delivered' ? 'bg-primary' : 
                    order.status === 'cancelled' ? 'bg-destructive' : 'bg-secondary'
                   }>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
                <Button asChild variant="outline" size="sm" className="ml-4">
                  <Link to={`/order-history/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
