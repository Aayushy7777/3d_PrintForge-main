import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddressCard from './AddressCard';
import AddAddressModal from './AddAddressModal';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

export interface Address {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  house_number: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  delivery_instructions?: string;
  created_at: string;
}

export default function SavedAddresses() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const fetchAddresses = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<unknown>('/api/users/addresses');
      setAddresses(Array.isArray(data) ? (data as Address[]) : ((data as { addresses?: Address[] })?.addresses || []));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load addresses';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);



  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await api.delete(`/api/users/addresses/${addressId}`);

      setAddresses(addresses.filter((addr) => addr.id !== addressId));
      toast({
        title: 'Success',
        description: 'Address deleted successfully',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete address';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleAddressSaved = async () => {
    await fetchAddresses();
    setShowModal(false);
    toast({
      title: 'Success',
      description: editingAddress ? 'Address updated successfully' : 'Address added successfully',
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Saved Addresses</h2>
        <Button onClick={handleAddAddress} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Address
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            No saved addresses yet
          </p>
          <p className="text-muted-foreground mb-6">
            Add your first address to make checkout faster
          </p>
          <Button onClick={handleAddAddress}>Add Address</Button>
        </div>
      ) : (
        /* Addresses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddAddressModal
        open={showModal}
        onOpenChange={setShowModal}
        editingAddress={editingAddress}
        onSaved={handleAddressSaved}
      />
    </div>
  );
}
