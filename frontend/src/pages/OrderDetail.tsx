import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Order, OrderItem } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, MapPin, Truck, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/common/Skeleton";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await api.get<Order>(`/api/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-20 px-4 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) return <div className="text-center py-20">Order not found</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Link to="/order-history" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to History
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.order_number || order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20">
            {order.status.toUpperCase()}
          </Badge>
          <Badge className="px-4 py-1 text-sm variant-outline">
            PAYMENT: {order.payment_status.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none bg-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="mr-2 h-5 w-5" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.items?.map((item: OrderItem) => (
                  <div key={item.id} className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-background rounded-lg border overflow-hidden flex-shrink-0">
                        <img src={item.product_image || '/placeholder.png'} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{item.product_name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatCurrency((item.unit_price || 0) * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-secondary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Truck className="mr-2 h-5 w-5" /> Tracking Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-muted-foreground/20">
                <div className="relative flex items-center space-x-4">
                  <div className={`h-10 w-10 flex-shrink-0 rounded-full border-4 border-background z-10 flex items-center justify-center ${
                    ['confirmed', 'shipped', 'delivered'].includes(order.status) ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Confirmed</p>
                    <p className="text-xs text-muted-foreground">{order.created_at ? formatDate(order.created_at) : '...'}</p>
                  </div>
                </div>
                <div className="relative flex items-center space-x-4">
                  <div className={`h-10 w-10 flex-shrink-0 rounded-full border-4 border-background z-10 flex items-center justify-center ${
                    ['shipped', 'delivered'].includes(order.status) ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Shipped</p>
                    <p className="text-xs text-muted-foreground">{order.shipped_at ? formatDate(order.shipped_at) : 'Pending'}</p>
                  </div>
                </div>
                <div className="relative flex items-center space-x-4">
                  <div className={`h-10 w-10 flex-shrink-0 rounded-full border-4 border-background z-10 flex items-center justify-center ${
                    order.status === 'delivered' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Delivered</p>
                    <p className="text-xs text-muted-foreground">{order.delivered_at ? formatDate(order.delivered_at) : 'Pending'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-bold">{order.delivery_address?.full_name}</p>
              <p>{order.delivery_address?.address_line1}</p>
              {order.delivery_address?.address_line2 && <p>{order.delivery_address?.address_line2}</p>}
              <p>{order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.postal_code}</p>
              <p className="mt-2 text-muted-foreground">Phone: {order.delivery_address?.phone_number}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping_amount === 0 ? 'FREE' : formatCurrency(order.shipping_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
