import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/admin/ProductForm";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { Product } from "@/types";

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading: loading } = useAdminProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleCreateOrUpdate = async (formData: Partial<Product>) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, formData }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingProduct(null);
        }
      });
    } else {
      createProduct.mutate(formData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingProduct(null);
        }
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    deleteProduct.mutate(id);
  };

  const filteredProducts = products.filter((p: Product) => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products by name or SKU..." 
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <ProductForm 
              initialData={editingProduct} 
              onSubmit={handleCreateOrUpdate} 
              isLoading={createProduct.isPending || updateProduct.isPending} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/20">
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((p: Product) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded border bg-secondary/30 overflow-hidden flex-shrink-0">
                      <img src={p.thumbnail_url || p.image_url || p.image || '/placeholder.png'} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">SKU: {p.sku || 'N/A'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{p.categories?.name}</TableCell>
                <TableCell className="font-semibold">₹{p.price.toLocaleString()}</TableCell>
                <TableCell>
                   <span className={p.stock_quantity <= 5 ? "text-destructive font-bold" : ""}>
                     {p.stock_quantity}
                   </span>
                </TableCell>
                <TableCell>
                  <Badge variant={p.is_active ? "default" : "secondary"}>
                    {p.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingProduct(p);
                      setIsDialogOpen(true);
                    }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
