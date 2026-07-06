export interface User {
  id: string;
  email?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  category: string;
  categories?: { name: string; id?: string };
  category_id?: string;
  image?: string;
  image_url?: string;
  thumbnail_url?: string;
  product_images?: { image_url: string }[];
  is_featured?: boolean;
  inStock?: boolean;
  stock?: number;
  stockQuantity?: number;
  rating?: number;
  reviews_count?: number;
  reviews?: Review[];
  created_at?: string;
  is_active?: boolean;
  stock_quantity?: number;
  sku?: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone_number?: string;
  phone?: string;
  email?: string;
  house_number?: string;
  address_line1?: string;
  address_line2?: string;
  street?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  delivery_instructions?: string;
  is_default?: boolean;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time?: number;
  total_price?: number;
  product?: Product;
  product_name?: string;
  product_image?: string;
  unit_price?: number;
  material?: string;
}

export interface Order {
  id: string;
  order_number?: string;
  user_id: string;
  user?: { id?: string; email?: string; name?: string; phone?: string };
  profiles?: { full_name?: string; email?: string };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status?: string;
  total_amount: number;
  subtotal?: number;
  shipping_amount?: number;
  tax_amount?: number;
  discount_amount?: number;
  shipping_address_id?: string;
  shipping_address?: Address;
  delivery_address?: Address;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  body?: string;
  comment?: string;
  is_verified_purchase?: boolean;
  created_at: string;
  user?: Profile;
  profiles?: { full_name?: string; avatar_url?: string };
}
