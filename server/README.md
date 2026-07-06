# PrintForge Backend

This is a minimal Express + Supabase (PostgreSQL) backend for the PrintForge frontend.

Quick start

1. Change into the `server` folder:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`) and set:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

4. Test database connection:

```bash
npm run test
```

5. Seed products (optional):

```bash
npm run seed
```

6. Start the server in development mode:

```bash
npm run dev
```

API endpoints

- `GET /api/products` - list products
- `GET /api/products/:id` - product detail
- `POST /api/products` - create product (admin)
- `POST /api/orders` - create order
- `GET /api/orders/:id` - get order
- `POST /api/auth/register` - register
- `POST /api/auth/login` - login
- `GET /api/auth/me` - current user (JWT)

Static assets

- Images and other frontend assets under `src/assets` are served at `/assets`.
- Public folder is served at `/public`.

For example, after starting the server locally the Geometric Vase image will be available at:
`http://localhost:5000/assets/product-vase.jpg`

Supabase setup

1. Create a Supabase project and database.
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
3. (Optional) run `npm run seed` from this folder to populate the `products` table from `data/products.json`.
