import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';
import AddressForm from './AddressForm';

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressSaved: (addressId: string) => void;
  userEmail?: string;
  token: string;
}

export default function AddressDialog({
  open,
  onOpenChange,
  onAddressSaved,
  userEmail = '',
  token,
}: AddressDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddressSaved = (addressId: string) => {
    setIsProcessing(false);
    onOpenChange(false);
    onAddressSaved(addressId);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Address
          </DialogTitle>
          <DialogDescription>
            Please enter your delivery address details. This information will be used for order fulfillment.
          </DialogDescription>
        </DialogHeader>

        <AddressForm
          onSuccess={handleAddressSaved}
          onCancel={handleCancel}
          defaultEmail={userEmail}
          isLoading={isProcessing}
          token={token}
        />
      </DialogContent>
    </Dialog>
  );
}
