import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";

import { Product } from "@/types";

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: Partial<Product>) => void;
  isLoading: boolean;
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>(initialData || {
    name: '',
    description: '',
    price: 0,
    stock_quantity: 10,
    is_active: true,
    is_featured: false,
    category_id: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<Product>) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: string, checked: boolean) => {
    setFormData((prev: Partial<Product>) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. Master Chief Helmet"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Full product description..."
              className="min-h-[150px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input 
                id="price" 
                name="price" 
                type="number" 
                value={formData.price} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input 
                id="stock_quantity" 
                name="stock_quantity" 
                type="number" 
                value={formData.stock_quantity} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active Status</Label>
                <Switch 
                  id="is_active" 
                  checked={formData.is_active} 
                  onCheckedChange={(c) => handleToggle('is_active', c)} 
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_featured">Featured Product</Label>
                <Switch 
                  id="is_featured" 
                  checked={formData.is_featured} 
                  onCheckedChange={(c) => handleToggle('is_featured', c)} 
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label>Product Image</Label>
            <div className="relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 hover:bg-secondary/20 transition-colors cursor-pointer group">
              {formData.thumbnail_url ? (
                <>
                  <img src={formData.thumbnail_url} className="h-full w-full object-cover rounded-lg" />
                  <button className="absolute top-2 right-2 p-1 bg-background rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Click to upload or drag & drop</span>
                </>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full py-6" disabled={isLoading}>
            {initialData ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
