
import { supabase } from './config/supabase.js';

const CATEGORIES = [
  { name: 'Controller Stands', slug: 'controller-stands', description: 'Display and organizational stands for gaming controllers.' },
  { name: 'Game Storage', slug: 'game-storage', description: 'Solutions for organizing your game collection.' },
  { name: 'VR Accessories', slug: 'vr-accessories', description: 'Enhanced experience for Virtual Reality hardware.' },
  { name: 'Gaming Decor', slug: 'gaming-decor', description: '3D printed decorative items for your gaming setup.' }
];

const PRODUCTS = [
  {
    name: "Xbox Invisible Controller Stand",
    description: "Ultra minimal invisible style stand designed to hold Xbox controllers while keeping the focus on the controller itself.",
    price: 100,
    category: "Controller Stands",
    image: "https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/invisible%20stand.png",
    featured: true
  },
  {
    name: "PS5 Controller Stand Holder",
    description: "Classic 3D printed PS5 controller holder designed for stable desk display.",
    price: 250,
    category: "Controller Stands",
    image: "https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/PS5%20Logo.png",
    featured: true
  },
  {
    name: "PS5 Spider-Man Controller Stand",
    description: "Spider-Man themed 3D printed PS5 controller stand perfect for Marvel fans.",
    price: 450,
    category: "Controller Stands",
    image: "https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/spiderman.png",
    featured: true
  },
  {
    name: "PS5 Symbol Controller Stand",
    description: "Minimal PlayStation symbol themed controller stand designed for PS5 controllers.",
    price: 500,
    category: "Controller Stands",
    image: "https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/spiderman%202.png",
    featured: true
  },
  {
    name: "Hexagonal Controller Stand",
    description: "Modern hexagonal design controller stand ideal for gaming desk setups.",
    price: 400,
    category: "Controller Stands",
    image: "https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/Hexagonal.png",
    featured: true
  },
  {
    name: "IKEA Skadis PS5 Controller Holder",
    description: "Controller holder compatible with IKEA Skadis pegboard systems.",
    price: 350,
    category: "Controller Stands",
    image: "https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/ikea.png",
    featured: true
  },
  {
    name: "PS5 Game Stand",
    description: "Display stand designed to organize PS5 game discs neatly.",
    price: 750,
    category: "Game Storage",
    image: "https://cicygufvlwgireguvefl.supabase.co/storage/v1/object/public/images/ps5%20game%20stand.png",
    featured: true
  }
];

function slugify(text) {
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

async function runSeed() {
  console.log('🚀 Starting production seed...');

  // 1. Seed Categories
  console.log('--- Seeding Categories ---');
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .upsert(CATEGORIES, { onConflict: 'slug' })
    .select();

  if (catError) {
    console.error('Error seeding categories:', catError.message);
    return;
  }
  console.log(`✅ Seeded ${catData.length} categories.`);

  // Create a map of category names to IDs
  const catMap = catData.reduce((acc, cat) => {
    acc[cat.name] = cat.id;
    return acc;
  }, {});

  // 2. Seed Products
  console.log('--- Seeding Products ---');
  const productRows = PRODUCTS.map(p => ({
    name: p.name,
    slug: slugify(p.name),
    description: p.description,
    price: p.price,
    category_id: catMap[p.category],
    main_image: p.image,
    images: [p.image],
    is_featured: p.featured,
    is_active: true
  }));

  const { data: prodData, error: prodError } = await supabase
    .from('products')
    .upsert(productRows, { onConflict: 'slug' })
    .select();

  if (prodError) {
    console.error('Error seeding products:', prodError.message);
    return;
  }
  console.log(`✅ Seeded ${prodData.length} products.`);
  console.log('🎉 Seed completed successfully!');
}

runSeed();
