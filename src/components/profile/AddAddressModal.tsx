import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Address } from './SavedAddresses';
import { api } from '@/lib/api';

// Validation schema
const addressSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone_number: z.string().regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
    'Invalid phone number format'
  ),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  house_number: z.string().min(1, 'House/Flat number is required'),
  street: z.string().min(3, 'Street/Area must be at least 3 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  postal_code: z.string().regex(
    /^[A-Za-z0-9\s-]{3,10}$/,
    'Invalid postal code format'
  ),
  country: z.string().min(2, 'Please select a country'),
  delivery_instructions: z.string().max(500, 'Max 500 characters').optional().or(z.literal('')),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAddress: Address | null;
  onSaved: () => void;
}

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'China',
  'Brazil',
  'Other',
];

export default function AddAddressModal({
  open,
  onOpenChange,
  editingAddress,
  onSaved,
}: AddAddressModalProps) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: '',
      phone_number: '',
      email: '',
      house_number: '',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      delivery_instructions: '',
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (editingAddress && open) {
      form.reset({
        full_name: editingAddress.full_name,
        phone_number: editingAddress.phone_number,
        email: editingAddress.email || '',
        house_number: editingAddress.house_number,
        street: editingAddress.street,
        city: editingAddress.city,
        state: editingAddress.state,
        postal_code: editingAddress.postal_code,
        country: editingAddress.country,
        delivery_instructions: editingAddress.delivery_instructions || '',
      });
    } else if (!editingAddress && open) {
      form.reset({
        full_name: '',
        phone_number: '',
        email: '',
        house_number: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        delivery_instructions: '',
      });
    }
  }, [editingAddress, open, form]);

  const onSubmit = async (data: AddressFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      if (editingAddress) {
        await api.put(`/api/users/addresses/${editingAddress.id}`, data);
      } else {
        await api.post('/api/users/addresses', data);
      }

      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          <DialogDescription>
            {editingAddress
              ? 'Update your delivery address details'
              : 'Enter your delivery address details'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., +91 9876543210"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* House/Flat Number */}
            <FormField
              control={form.control}
              name="house_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>House / Flat Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 123, Apt 4B"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Street/Area */}
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street / Area *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Main Street, Downtown"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., New York"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* State */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State / Province *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., New York"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Postal Code */}
            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code / PIN *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 10001"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Country */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Instructions */}
            <FormField
              control={form.control}
              name="delivery_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Instructions (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Leave at front door, Ring doorbell twice"
                      className="min-h-24"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingAddress ? 'Update Address' : 'Add Address'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              * Fields marked with asterisk are required
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
