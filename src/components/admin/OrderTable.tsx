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

function formatAmount(value?: number, currency = "INR") {
  const symbol = currency === "USD" ? "$" : "₹";
  return `${symbol}${Number(value || 0).toLocaleString("en-IN")}`;
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

function getPaymentBadge(status?: string) {
  if (status === "paid") return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Paid</Badge>;
  if (status === "cod") return <Badge variant="secondary">COD</Badge>;
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="outline">Unpaid</Badge>;
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

function Field({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-sm ${mono ? "font-mono text-xs break-all" : ""}`}>{value ?? "—"}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-2 border-b bg-muted/30">
        {title}
      </p>
      <div className="p-4 grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
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

  const addr = selectedOrder?.delivery_address;

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
                <TableCell className="font-semibold">{formatAmount(order.total_amount, order.currency)}</TableCell>
                <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder?.order_number || selectedOrder?.id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5">
              {/* Status / payment / total snapshot */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Order Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Payment</p>
                  {getPaymentBadge(selectedOrder.payment_status)}
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Method</p>
                  <p className="text-sm capitalize">{selectedOrder.payment_method || "—"}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total</p>
                  <p className="text-lg font-bold">{formatAmount(selectedOrder.total_amount, selectedOrder.currency)}</p>
                </div>
              </div>

              <Section title="Order Details">
                <Field label="Order ID" value={selectedOrder.id} mono />
                <Field label="User ID" value={selectedOrder.user_id} mono />
                <Field label="Currency" value={selectedOrder.currency || "INR"} />
                <Field label="Delivery Address ID" value={selectedOrder.delivery_address_id} mono />
                <Field label="Created At" value={format(new Date(selectedOrder.created_at), "PPpp")} />
                <Field label="Updated At" value={selectedOrder.updated_at ? format(new Date(selectedOrder.updated_at), "PPpp") : undefined} />
              </Section>

              <Section title="Customer">
                <Field label="Name" value={selectedOrder.user?.name || selectedOrder.profiles?.full_name} />
                <Field label="Email" value={getCustomer(selectedOrder)} />
              </Section>

              <Section title="Payment">
                <Field label="Payment Status" value={selectedOrder.payment_status} />
                <Field label="Payment Method" value={selectedOrder.payment_method} />
                <Field label="Payment ID" value={selectedOrder.payment_id} mono />
                <Field label="Razorpay Order ID" value={selectedOrder.razorpay_order_id} mono />
              </Section>

              <Section title="Delivery Address">
                <Field label="Full Name" value={addr?.full_name} />
                <Field label="Phone" value={addr?.phone_number || addr?.phone} />
                <Field label="Email" value={addr?.email} />
                <Field label="House / Apt" value={addr?.house_number} />
                <Field label="Street / Area" value={addr?.street || addr?.address_line1} />
                <Field label="City" value={addr?.city} />
                <Field label="State" value={addr?.state} />
                <Field label="Postal Code" value={addr?.postal_code} />
                <Field label="Country" value={addr?.country} />
                <Field label="Delivery Instructions" value={addr?.delivery_instructions} />
              </Section>

              <div className="rounded-lg border overflow-hidden">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-2 border-b bg-muted/30">
                  Items ({selectedOrder.items?.length || 0})
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedOrder.items || []).map((item, idx) => (
                      <TableRow key={item.id || idx}>
                        <TableCell className="font-medium">
                          {item.product_name || item.product?.name || item.product_id}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.product_id}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatAmount(item.unit_price ?? item.price_at_time, selectedOrder.currency)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount((item.unit_price ?? item.price_at_time ?? 0) * (item.quantity || 1), selectedOrder.currency)}
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
