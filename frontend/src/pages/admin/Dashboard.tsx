import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAdminOrders } from "@/hooks/useOrders";
import { StatCard } from "@/components/admin/StatCard";
import { OrderTable } from "@/components/admin/OrderTable";
import { 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Package, 
  Clock, 
  AlertTriangle 
} from "lucide-react";
import { Skeleton } from "@/components/common/Skeleton";

interface AdminStats {
  total_revenue: number;
  total_orders: number;
  total_users: number;
  total_products: number;
  low_stock_count: number;
  pending_orders: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/api/admin/stats'),
  });

  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders({ limit: '5' });
  const recentOrders = ordersData?.orders || [];
  const loading = statsLoading || ordersLoading;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats?.total_revenue.toLocaleString()}`} 
          icon={IndianRupee}
          trend={{ value: 12, isUp: true }}
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.total_orders} 
          icon={ShoppingBag}
          trend={{ value: 8, isUp: true }}
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.total_users} 
          icon={Users}
        />
        <StatCard 
          title="Products" 
          value={stats?.total_products} 
          icon={Package}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Orders</h2>
          </div>
          <OrderTable orders={recentOrders} />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Alerts</h2>
          <div className="space-y-4">
            {stats?.low_stock_count > 0 && (
              <div className="flex items-start p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="h-5 w-5 text-destructive mr-3 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Low Stock Alert</p>
                  <p className="text-xs text-muted-foreground">{stats.low_stock_count} products are almost out of stock.</p>
                </div>
              </div>
            )}
            {stats?.pending_orders > 0 && (
              <div className="flex items-start p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Clock className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Action Required</p>
                  <p className="text-xs text-muted-foreground">{stats.pending_orders} orders are waiting to be processed.</p>
                </div>
              </div>
            )}
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center text-center">
              <ShoppingBag className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-bold mb-2">Grow Your Store</h3>
              <p className="text-xs text-muted-foreground mb-4">You have 12 potential customers who abandoned their carts today.</p>
              <button className="text-xs font-bold text-primary hover:underline">View Recovery Options</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
