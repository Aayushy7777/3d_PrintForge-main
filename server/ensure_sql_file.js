
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendPath = path.join(__dirname, '..', 'backend');

// Ensure directory exists
if (!fs.existsSync(backendPath)) {
  fs.mkdirSync(backendPath, { recursive: true });
}

const filePath = path.join(backendPath, 'SUPABASE_CARTS_SETUP.sql');

const sqlContent = `-- Carts Table
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_cart UNIQUE (user_id)
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_cart_item UNIQUE (cart_id, product_id)
);
`;

fs.writeFileSync(filePath, sqlContent);
console.log(`Updated ${filePath}`);
