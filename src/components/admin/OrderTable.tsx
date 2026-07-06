import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Order } from "@/types";
import { useUpdateOrderStatus } from "@/hooks/useOrders";

interface OrderTableProps {
  orders: Order[];
}

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function formatAmount(value?: number) {
  return `INR ${Number(value || 0).toLocaleString("en-IN")}`;
}

function getStatusBadge(status?: string) {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmed</Badge>;
    case "processing":
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Processing</Badge>;
    case "shipped":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Shipped</Badge>;
    case "delivered":
      return <Badge className="bg-primary/10 text-primary border-primary/20">Delivered</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

function getCustomer(order: Order) {
  return order.user?.email || order.profiles?.email || order.profiles?.full_name || "Customer";
}

function getItemsLabel(order: Order) {
  const items = order.items || [];
  if (items.length === 0) return "No items";
  return items
    .slice(0, 2)
    .map((item) => `${item.product_name || item.product?.name || item.product_id} x ${item.quantity}`)
    .join(", ");
}

function getMaterials(order: Order) {
  const materials = new Set((order.items || []).map((item) => item.material || "PLA"));
  return [...materials].join(", ") || "PLA";
}

export function OrderTable({ orders }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const updateStatus = useUpdateOrderStatus();

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
        No orders found.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20">
              <TableHead className="font-semibold">Order ID</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Items</TableHead>
              <TableHead className="font-semibold">Material</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Payment</TableHead>
              <TableHead className="font-semibold">Order Status</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="text-right font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-secondary/10 transition-colors">
                <TableCell className="font-medium font-mono text-xs">
                  #{order.order_number || order.id.slice(0, 8)}
                </TableCell>
                <TableCell>{getCustomer(order)}</TableCell>
                <TableCell className="max-w-56 truncate">{getItemsLabel(order)}</TableCell>
                <TableCell>{getMaterials(order)}</TableCell>
                <TableCell className="font-semibold">{formatAmount(order.total_amount)}</TableCell>
                <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(status) => updateStatus.mutate({ id: order.id, status })}
                  >
                    <SelectTrigger className="h-9 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {format(new Date(order.created_at), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.order_number || selectedOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border p-4">
                  <p className="font-semibold mb-2">Customer</p>
                  <p>{selectedOrder.user?.name || selectedOrder.profiles?.full_name || "Customer"}</p>
                  <p className="text-muted-foreground">{getCustomer(selectedOrder)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="font-semibold mb-2">Delivery Address</p>
                  <p>{selectedOrder.delivery_address?.full_name}</p>
                  <p className="text-muted-foreground">
                    {[
                      selectedOrder.delivery_address?.house_number,
                      selectedOrder.delivery_address?.address_line1,
                      selectedOrder.delivery_address?.street,
                    ].filter(Boolean).join(" ")}
                  </p>
                  <p className="text-muted-foreground">
                    {[
                      selectedOrder.delivery_address?.city,
                      selectedOrder.delivery_address?.state,
                      selectedOrder.delivery_address?.postal_code,
                    ].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-muted-foreground">
                    {selectedOrder.delivery_address?.phone_number || selectedOrder.delivery_address?.phone}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedOrder.items || []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name || item.product?.name || item.product_id}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.material || "PLA"}</TableCell>
                        <TableCell className="text-right">
                          {formatAmount(item.total_price || item.unit_price || item.price_at_time)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
