import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const inStock = product.inStock === true || (product.stockQuantity ?? product.stock_quantity ?? product.stock ?? 0) > 0;
  const productPath = `/products/${product.slug || product.id}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item to cart';
      toast.error(message);
    }
  };

  return (
    <Card className="group overflow-hidden border-none bg-secondary/30 transition-all hover:bg-secondary/50">
      <Link to={productPath}>
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.thumbnail_url || product.image_url || product.image || '/placeholder.png'}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.is_featured && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-[2px]">
              <Badge variant="destructive" className="text-sm px-4 py-1">Out of Stock</Badge>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center space-x-3">
            <Button size="icon" variant="secondary" className="rounded-full">
              <Eye className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="rounded-full"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
          {product.categories?.name || product.category || 'Uncategorized'}
        </p>
        <Link to={productPath} className="block">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2">
          <StarRating rating={product.rating || 0} size="sm" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="text-xl font-bold">₹{product.price}</span>
        {product.compare_at_price && (
          <span className="text-sm text-muted-foreground line-through ml-2">
            ₹{product.compare_at_price}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}