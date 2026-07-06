import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Order } from '@/types';
import toast from 'react-hot-toast';

export function useOrders(options: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['orders', options],
    queryFn: async () => {
      const query = new URLSearchParams(options).toString();
      const data = await api.get(`/api/orders?${query}`);
      return (data || []) as Order[];
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');
      const data = await api.get(`/api/orders/${id}`);
      return data as Order;
    },
    enabled: !!id,
  });
}

export function useAdminOrders(options: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['admin-orders', options],
    queryFn: async () => {
      const query = new URLSearchParams(options).toString();
      const data = await api.get(`/api/admin/orders?${query}`);
      return {
        orders: (data.orders || []) as Order[],
        total: (data.total || 0) as number,
      };
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await api.put(`/api/admin/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });
}
