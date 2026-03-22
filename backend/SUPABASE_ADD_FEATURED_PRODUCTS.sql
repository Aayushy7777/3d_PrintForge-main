-- Enable extension for uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DROP OLD TABLE
---------------------------------------------------

DROP TABLE IF EXISTS public.products CASCADE;

---------------------------------------------------
-- SLUGIFY FUNCTION
---------------------------------------------------

CREATE OR REPLACE FUNCTION slugify(input text)
RETURNS text AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(input, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

---------------------------------------------------
-- PRODUCTS TABLE
---------------------------------------------------

CREATE TABLE public.products (

id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

name text NOT NULL,

slug text UNIQUE,

description text,

price integer,

category text,

image text,

materials text[],

colors text[],

"printTime" text,

rating numeric,

reviews integer,

"inStock" boolean DEFAULT true,

featured boolean DEFAULT false,

created_at timestamp DEFAULT now()

);

-- SLUG TRIGGER FUNCTION (NO DUPLICATES)
---------------------------------------------------

CREATE OR REPLACE FUNCTION products_set_slug()
RETURNS trigger AS $$
DECLARE
  base text;
BEGIN
  base := slugify(COALESCE(NEW.name, ''));
  NEW.slug := base || '-' || substr(uuid_generate_v4()::text,1,6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---------------------------------------------------
-- CREATE TRIGGER
---------------------------------------------------

CREATE TRIGGER set_products_slug
BEFORE INSERT OR UPDATE
ON public.products
FOR EACH ROW
EXECUTE FUNCTION products_set_slug();

---------------------------------------------------
-- INSERT PRODUCTS (22 PRODUCTS)
---------------------------------------------------

INSERT INTO public.products
(name, description, price, category, image, materials, colors, "printTime", rating, reviews, "inStock", featured)
VALUES
('Xbox Invisible Controller Stand',
'Ultra minimal invisible style stand designed to hold Xbox controllers.',
100,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/invisible%20stand.png',
ARRAY['PLA'],
ARRAY['White','Black'],
'1 hr',4.6,25,true,true),

('PS5 Controller Stand Holder – Compact Desk Stand',
'Compact desk stand for the PS5 controller, designed for stable display.',
300,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/PS5%20Logo.png',
ARRAY['PLA'],
ARRAY['White','Black'],
'3 hrs',4.7,50,true,true),

('PS5 Spider-Man Controller Stand',
'Spider-Man themed PS5 controller stand.',
450,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/spiderman.png',
ARRAY['PLA','ABS'],
ARRAY['Red','Black'],
'3 hrs',4.8,80,true,true),

('PS5 Symbol Controller Stand',
'PlayStation symbol themed stand.',
500,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/spiderman%202.png',
ARRAY['PLA'],
ARRAY['White','Black'],
'5 hrs',4.7,40,true,true),

('Hexagonal Controller Stand',
'Modern hexagonal gaming stand.',
400,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/Hexagonal.png',
ARRAY['PLA','PETG'],
ARRAY['Black','Grey'],
'3 hrs',4.6,70,true,true),

('IKEA Skadis Pegboard',
'Controller holder compatible with IKEA Skadis.',
350,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/ikea.png',
ARRAY['PLA'],
ARRAY['White','Black'],
'2 hrs',4.6,32,true,true),

('crystal shaped PS5 controller holder',
'Soft cushion style controller holder.',
500,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/Crystal.png',
ARRAY['PLA'],
ARRAY['White'],
'1 Day',4.8,22,true,false),

('PlayStation 5 Controller Stand',
'Ergonomic PS5 controller display stand.',
500,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/crystal%20inspired%20stand.png',
ARRAY['PLA'],
ARRAY['White','Black'],
'3.5 hrs',4.7,60,true,true),

('Crystal PS5 Controller Holder',
'Crystal inspired premium controller stand.',
750,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/meta%20stand.png',
ARRAY['PLA'],
ARRAY['Transparent','White'],
'7 hrs',4.8,45,true,true),

('PlayStation Zombie Hand Controller Holder',
'Zombie hand horror themed holder.',
750,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/Zombie%20Hand.png',
ARRAY['PLA'],
ARRAY['Green','Black'],
'9 hrs',4.9,110,true,true),

('PS5 Game Stand',
'PS5 game disk organizer stand.',
750,
'Game Storage',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/ps5%20game%20stand.png',
ARRAY['PLA'],
ARRAY['White','Black'],
'5 hrs',4.6,48,true,true),

('Sculptural Game Rack – 6 Slot for PS5 LOGO',
'A sleek, sculptural game rack designed to hold 6 game cases, featuring the iconic PS5 logo styling.',
700,
'Game Storage',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/disk%20holder.png',
ARRAY['PLA'],
ARRAY['White','Black'],
'5 hrs',4.7,30,true,true),

('Xbox / PlayStation Zombie Hand Holder',
'Universal zombie controller holder.',
850,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/zombie%20holder.png',
ARRAY['PLA'],
ARRAY['Green','Black'],
'7 hrs',4.8,90,true,true),

('Spooky Controller Stand',
'Halloween themed spooky stand.',
1000,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/Spooky%20Controller%20Stand%20.png',
ARRAY['PLA'],
ARRAY['Black','Orange'],
'10 hrs',4.7,55,true,true),

('Darth Vader PS5 Stand',
'Star Wars themed Darth Vader stand.',
650,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/star%20wars.png',
ARRAY['PLA'],
ARRAY['Black'],
'5 hrs',4.9,95,true,true),

('PlayStation VR2 Headset and Controller Station',
'VR2 headset docking station.',
1000,
'VR Accessories',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/PlayStation%20VR2%20Headset%20and%20Controller%20Stand.png',
ARRAY['PLA','PETG'],
ARRAY['White','Black'],
'10 hrs',4.9,120,true,true),

('Peely Banana PS5 Controller Stand',
'Fortnite Peely themed controller stand.',
750,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/Peely%20Banana%20PS5%20Controller%20Stand.png',
ARRAY['PLA'],
ARRAY['Yellow'],
'9 hrs',4.8,77,true,true),

('Zombie Hand PS5/Xbox Controller Holder',
'Heavy zombie controller stand.',
1100,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/Wall%20Mounted.png',
ARRAY['PLA'],
ARRAY['Green','Black'],
'11 hrs',4.8,68,true,true),

('Yotei Ghost Controller Holder',
'Ghost themed holder.',
350,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/GOY%20controller%20holder.png',
ARRAY['PLA'],
ARRAY['Black'],
'3 hrs',4.6,30,true,true),

('Ghost of Yotei Mask',
'Gaming wall decoration mask.',
1200,
'Gaming Decor',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/Ghost%20of%20Yotei%20mask.png',
ARRAY['PLA'],
ARRAY['Black','Red'],
'1.5 day',4.8,42,true,true),

('Dual controller holder',
'Multi-purpose desk organizer.',
750,
'Game Storage',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/dual%20controller%20holder.png',
ARRAY['PLA'],
ARRAY['White','Grey'],
'5 hrs',4.6,33,true,true),

('Demogorgon Controller Stand',
'Stranger Things Demogorgon themed stand.',
750,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/Demogorgon.png',
ARRAY['PLA'],
ARRAY['Red','Black'],
'8 hrs',4.9,120,true,true),

('Xbox Logo Controller Stand',
'Xbox logo themed controller holder.',
450,
'Controller Stands',
'https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/xbox%20logo%20stand.png',
ARRAY['PLA'],
ARRAY['Green','Black'],
'4 hrs',4.7,35,true,true);
