import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data (careful with this in production!)
  // await prisma.review.deleteMany({});
  // await prisma.orderItem.deleteMany({});
  // await prisma.order.deleteMany({});
  // await prisma.cartItem.deleteMany({});
  // await prisma.payment.deleteMany({});
  // await prisma.product.deleteMany({});
  // await prisma.category.deleteMany({});
  // await prisma.deliveryAddress.deleteMany({});
  // await prisma.user.deleteMany({});

  // Create Categories
  const sculptureCategory = await prisma.category.upsert({
    where: { slug: 'sculptures' },
    update: {},
    create: {
      name: 'Sculptures',
      slug: 'sculptures',
      description: 'Artistic 3D printed sculptures and art pieces',
      icon: '🎨',
    },
  });

  const techCategory = await prisma.category.upsert({
    where: { slug: 'tech-parts' },
    update: {},
    create: {
      name: 'Tech Parts',
      slug: 'tech-parts',
      description: 'Precision engineered technical components',
      icon: '⚙️',
    },
  });

  const prototypeCategory = await prisma.category.upsert({
    where: { slug: 'prototypes' },
    update: {},
    create: {
      name: 'Prototypes',
      slug: 'prototypes',
      description: 'Quick and affordable product prototyping',
      icon: '⚡',
    },
  });

  const customCategory = await prisma.category.upsert({
    where: { slug: 'custom' },
    update: {},
    create: {
      name: 'Custom Items',
      slug: 'custom',
      description: 'Fully customizable bespoke creations',
      icon: '✨',
    },
  });

  console.log('✅ Categories created');

  // Create Sample Products
  const products = [
    {
      name: 'Dragon Figurine',
      slug: 'dragon-figurine',
      description: 'Detailed 3D printed dragon statue with intricate scales',
      price: '2499',
      costPrice: '800',
      image: 'https://via.placeholder.com/400x400?text=Dragon',
      materials: ['PLA', 'Resin'],
      colors: ['Red', 'Gold'],
      printTime: 480,
      weight: 150,
      dimensions: '120x80x100',
      complexity: 'High',
      inStock: true,
      stockQuantity: 5,
      isFeatured: true,
      categoryId: sculptureCategory.id,
    },
    {
      name: 'Phone Stand Pro',
      slug: 'phone-stand-pro',
      description: 'Ergonomic adjustable phone stand for desk',
      price: '499',
      costPrice: '150',
      image: 'https://via.placeholder.com/400x400?text=PhoneStand',
      materials: ['PETG'],
      colors: ['Black', 'White', 'Gray'],
      printTime: 120,
      weight: 50,
      dimensions: '80x60x100',
      complexity: 'Low',
      inStock: true,
      stockQuantity: 20,
      categoryId: techCategory.id,
    },
    {
      name: 'Mini Drone Frame',
      slug: 'mini-drone-frame',
      description: 'Lightweight FPV drone frame prototype',
      price: '1999',
      costPrice: '600',
      image: 'https://via.placeholder.com/400x400?text=Drone',
      materials: ['Carbon Nylon'],
      colors: ['Black'],
      printTime: 360,
      weight: 80,
      dimensions: '150x150x50',
      complexity: 'High',
      inStock: true,
      stockQuantity: 3,
      isFeatured: true,
      categoryId: prototypeCategory.id,
    },
    {
      name: 'Custom Logo Keychain',
      slug: 'custom-logo-keychain',
      description: 'Personalized keychain with your custom logo',
      price: '299',
      costPrice: '80',
      image: 'https://via.placeholder.com/400x400?text=Keychain',
      materials: ['PLA'],
      colors: ['Multi-color'],
      printTime: 60,
      weight: 20,
      dimensions: '40x30x10',
      complexity: 'Low',
      inStock: true,
      stockQuantity: 50,
      categoryId: customCategory.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        price: parseFloat(product.price),
        costPrice: product.costPrice ? parseFloat(product.costPrice) : undefined,
      },
    });
  }

  console.log('✅ Products created');

  // Create Test Users
  const hashPassword = async (password) => {
    const salt = await bcryptjs.genSalt(10);
    return await bcryptjs.hash(password, salt);
  };

  const adminPassword = await hashPassword('admin@123');
  const customerPassword = await hashPassword('customer@123');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@printforge.com' },
    update: {},
    create: {
      email: 'admin@printforge.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '+91 9999999999',
      role: 'ADMIN',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'John Doe',
      phone: '+91 8888888888',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Users created');

  // Create Sample Delivery Address
  await prisma.deliveryAddress.upsert({
    where: { id: 'addr-1' },
    update: {},
    create: {
      id: 'addr-1',
      userId: customerUser.id,
      fullName: 'John Doe',
      phone: '+91 8888888888',
      email: 'john@example.com',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
      isDefault: true,
    },
  });

  console.log('✅ Delivery addresses created');

  console.log('✨ Seed completed successfully!');
  console.log('\n📌 Test Credentials:');
  console.log('Admin:    admin@printforge.com / admin@123');
  console.log('Customer: customer@example.com / customer@123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('🔴 Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
