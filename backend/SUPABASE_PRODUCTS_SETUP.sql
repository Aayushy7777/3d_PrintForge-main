-- Run this in the Supabase SQL Editor to set up your products table and seed data

DROP TABLE IF EXISTS public.products;

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT,
  image TEXT,
  materials TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  "printTime" TEXT,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  "inStock" BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


