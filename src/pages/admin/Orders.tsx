import { useState } from "react";
import { useAdminOrders } from "@/hooks/useOrders";
import { OrderTable } from "@/components/admin/OrderTable";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Skeleton } from "@/components/common/Skeleton";
import { cn } from "@/lib/utils";

type QuickFilter = 'all' | 'active' | 'completed';

const QUICK_FILTERS: { key: QuickFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

export default function AdminOrders() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  const filters: Record<string, string> = {};
  if (status !== "all") filters.status = status;
  // "Completed" maps cleanly to an API-level status filter.
  if (quickFilter === "completed") filters.status = "delivered";
  if (search.trim()) filters.search = search.trim();

  const { data, isLoading: loading } = useAdminOrders(filters);
  // "Active" (anything but delivered/cancelled) can't be expressed as a single
  // "not equal" API filter, so fetch normally and filter client-side.
  let orders = data?.orders || [];
  if (quickFilter === "active") {
    orders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  }

  return (
    <div className="space-y-6">
      {/* Quick filter tabs — work alongside the status dropdown below */}
      <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
        {QUICK_FILTERS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setQuickFilter(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              quickFilter === tab.key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by order ID or customer..." 
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40 h-11">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <OrderTable orders={orders} />
      )}
    </div>
  );
}
