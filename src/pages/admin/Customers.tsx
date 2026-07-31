import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/common/Skeleton";
import { Search } from "lucide-react";
import { useAdminCustomers } from "@/hooks/useUsers";

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const { data: customers = [], isLoading: loading } = useAdminCustomers();

  const filteredCustomers = customers.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name or email..."
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">{customers.length} customers</span>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/20">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead className="text-right">Lifetime Spend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.email || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>{customer.order_count}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{customer.lifetime_spend.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
