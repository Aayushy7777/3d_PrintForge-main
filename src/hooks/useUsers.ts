import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AdminCustomer {
  id: string;
  name?: string | null;
  email?: string | null;
  created_at?: string;
  order_count: number;
  lifetime_spend: number;
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const data = await api.get('/api/admin/users');
      return (data || []) as AdminCustomer[];
    },
  });
}
