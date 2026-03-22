-- Run this in the Supabase SQL Editor to remove the initial 8 dummy products

DELETE FROM public.products
WHERE name IN (
  'Custom Mechanical Keyboard Case',
  'Articulated Dragon Toy',
  'Minimalist Headphone Stand',
  'Customized D&D Miniatures',
  'Ergonomic Laptop Riser',
  'Geometric Planter Pot',
  'Custom Keycaps (Set of 4)',
  'Adjustable Phone Stand'
);
