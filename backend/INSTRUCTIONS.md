# Supabase Node.js Backend

A production-ready Node.js & Express API powered by Supabase PostgreSQL.

## 🚀 Getting Started

Follow these steps to run the backend:

### 1. Database Setup
1. Go to your [Supabase Project](https://supabase.com).
2. Open the **SQL Editor**.
3. Copy the contents of `SUPABASE_SETUP.sql` and run it to create the `users` table.

### 2. Environment Variables
1. Rename `.env.example` to `.env`.
   ```bash
   cp .env.example .env
   ```
2. Fill in your environment variables:
   * **`SUPABASE_URL`**: Your API URL (Settings -> API).
   * **`SUPABASE_ANON_KEY`**: Your `anon` public key.
   * **`JWT_SECRET`**: Add a strong random string to secure your tokens.

### 3. Install Dependencies
Make sure you are in the `backend/` directory, then run:

```bash
npm install
```

### 4. Run the Server
For development mode with automatic restarts (using nodemon):

```bash
npm run dev
```

For production mode:

```bash
npm start
```

The server will be running on `http://localhost:5000` 🚀
