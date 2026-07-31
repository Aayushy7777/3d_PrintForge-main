import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/api";
import { useAdminCategories } from "@/hooks/useProducts";
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
    category_id: '',
    sku: '',
  });

  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useAdminCategories();

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

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      const data = await api.upload<{ url: string }>(
        '/api/admin/products/upload-image',
        uploadFormData
      );
      setFormData((prev) => ({ ...prev, thumbnail_url: data.url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadImage(file);
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={formData.category_id || undefined}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku || ''}
                onChange={handleChange}
                placeholder="e.g. HELM-MC-MK6"
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
            <div
              className={`relative aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 hover:bg-secondary/20 transition-colors cursor-pointer group ${
                isDragging ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </>
              ) : formData.thumbnail_url ? (
                <>
                  <img src={formData.thumbnail_url} className="h-full w-full object-cover rounded-lg" alt="Product preview" />
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1 bg-background rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({ ...prev, thumbnail_url: '' }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Click to upload or drag &amp; drop</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG or WebP · Max 5MB</p>
          </div>

          <Button type="submit" className="w-full py-6" disabled={isLoading}>
            {initialData ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
