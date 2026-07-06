import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Address } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Plus, Check } from "lucide-react";
import { Skeleton } from "@/components/common/Skeleton";
import AddAddressModal from "@/components/profile/AddAddressModal";

interface AddressSelectorProps {
  onSelect: (addressId: string) => void;
  selectedId?: string;
}

export function AddressSelector({ onSelect, selectedId }: AddressSelectorProps) {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const { data: addresses = [], isLoading: loading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => api.get('/api/users/addresses')
  });

  const normalizedAddresses = useMemo(() => addresses || [], [addresses]);

  useEffect(() => {
    if (normalizedAddresses.length > 0 && !selectedId) {
      onSelect(normalizedAddresses[0].id);
    }
  }, [normalizedAddresses, selectedId, onSelect]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {normalizedAddresses.map((address) => (
        <Card 
          key={address.id}
          className={`cursor-pointer transition-all border-2 ${
            selectedId === address.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
          }`}
          onClick={() => onSelect(address.id)}
        >
          <CardContent className="p-4 flex items-start space-x-4">
            <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
              selectedId === address.id ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
            }`}>
              {selectedId === address.id && <Check className="h-3 w-3" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span className="font-semibold">{address.full_name}</span>
                {address.is_default && (
                  <span className="ml-2 text-xs px-2 py-0.5 bg-secondary rounded-full uppercase">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {address.house_number}, {address.street},{" "}
                {address.city}, {address.state} - {address.postal_code}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Phone: {address.phone_number}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button variant="outline" className="w-full border-dashed py-8" onClick={() => setAddOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add New Address
      </Button>

      <AddAddressModal
        open={addOpen}
        onOpenChange={setAddOpen}
        editingAddress={null}
        onSaved={async () => {
          await queryClient.invalidateQueries({ queryKey: ['addresses'] });
        }}
      />
    </div>
  );
}
