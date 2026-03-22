-- Run this in the Supabase SQL Editor to clean up your products table.
-- This will delete the "PS5 Logo Controller Stand" that you removed, 
-- and it will remove any duplicate products created by running the INSERT script multiple times.

DELETE FROM public.products WHERE name = 'PS5 Logo Controller Stand';

DELETE FROM public.products
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (partition BY name ORDER BY created_at ASC) AS rnum
        FROM public.products
    ) t
    WHERE t.rnum > 1
);
