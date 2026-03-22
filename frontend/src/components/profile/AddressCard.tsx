import React from 'react';
import { MapPin, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Address } from './SavedAddresses';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
}: AddressCardProps) {
  return (
    <div className="border border-border rounded-lg p-5 hover:shadow-md transition-shadow bg-background">
      {/* Header with location icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">
            {address.full_name}
          </h3>
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div>
          <p className="text-muted-foreground">Phone</p>
          <p className="text-foreground font-medium">{address.phone_number}</p>
        </div>

        <div>
          <p className="text-muted-foreground">Address</p>
          <p className="text-foreground">
            {address.house_number}, {address.street}
          </p>
          <p className="text-foreground">
            {address.city}, {address.state} {address.postal_code}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Country</p>
          <p className="text-foreground">{address.country}</p>
        </div>

        {address.email && (
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="text-foreground">{address.email}</p>
          </div>
        )}

        {address.delivery_instructions && (
          <div>
            <p className="text-muted-foreground">Delivery Instructions</p>
            <p className="text-foreground italic">
              "{address.delivery_instructions}"
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(address)}
          className="flex-1 gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(address.id)}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
