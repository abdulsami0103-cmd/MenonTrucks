import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create main categories with subcategories (SRS Section 2.3)
  const categories = [
    {
      name: 'Trucks',
      slug: 'trucks',
      icon: 'truck',
      order: 1,
      children: [
        { name: 'Tractor Units', slug: 'tractor-units', order: 1 },
        { name: 'Heavy Duty', slug: 'heavy-duty-trucks', order: 2 },
        { name: 'Box Trucks', slug: 'box-trucks', order: 3 },
        { name: 'Tipper Trucks', slug: 'tipper-trucks', order: 4 },
        { name: 'Crane Trucks', slug: 'crane-trucks', order: 5 },
        { name: 'Container Trucks', slug: 'container-trucks', order: 6 },
        { name: 'Mega Trucks', slug: 'mega-trucks', order: 7 },
        { name: 'Torpedo Trucks', slug: 'torpedo-trucks', order: 8 },
      ],
    },
    {
      name: 'Semi Trailers',
      slug: 'semi-trailers',
      icon: 'container',
      order: 2,
      children: [
        { name: 'Lowloaders', slug: 'lowloaders', order: 1 },
        { name: 'Flatbeds', slug: 'flatbed-trailers', order: 2 },
        { name: 'Tippers', slug: 'tipper-trailers', order: 3 },
        { name: 'Reefer Trailers', slug: 'reefer-trailers', order: 4 },
        { name: 'Curtainsider', slug: 'curtainsider-trailers', order: 5 },
        { name: 'Closed Box', slug: 'closed-box-trailers', order: 6 },
      ],
    },
    {
      name: 'Full Trailers',
      slug: 'full-trailers',
      icon: 'trailer',
      order: 3,
      children: [
        { name: 'Closed Box', slug: 'full-closed-box', order: 1 },
        { name: 'Drop Side', slug: 'drop-side-trailers', order: 2 },
        { name: 'Tilt Trailers', slug: 'tilt-trailers', order: 3 },
      ],
    },
    {
      name: 'Construction Machinery',
      slug: 'construction-machinery',
      icon: 'hard-hat',
      order: 4,
      children: [
        { name: 'Excavators', slug: 'excavators', order: 1 },
        { name: 'Cranes', slug: 'cranes', order: 2 },
        { name: 'Loaders', slug: 'loaders', order: 3 },
        { name: 'Bulldozers', slug: 'bulldozers', order: 4 },
        { name: 'Aerial Platforms', slug: 'aerial-platforms', order: 5 },
      ],
    },
    {
      name: 'Agricultural Machinery',
      slug: 'agricultural-machinery',
      icon: 'tractor',
      order: 5,
      children: [
        { name: 'Tractors', slug: 'tractors', order: 1 },
        { name: 'Harvesters', slug: 'harvesters', order: 2 },
        { name: 'Tillage', slug: 'tillage', order: 3 },
      ],
    },
    {
      name: 'Material Handling',
      slug: 'material-handling',
      icon: 'forklift',
      order: 6,
      children: [
        { name: 'Forklifts', slug: 'forklifts', order: 1 },
        { name: 'Warehouse Equipment', slug: 'warehouse-equipment', order: 2 },
      ],
    },
    {
      name: 'Vans / LCV / Buses',
      slug: 'vans-lcv-buses',
      icon: 'bus',
      order: 7,
      children: [
        { name: 'Vans', slug: 'vans', order: 1 },
        { name: 'Light Commercial', slug: 'light-commercial', order: 2 },
        { name: 'Buses', slug: 'buses', order: 3 },
        { name: 'Minibuses', slug: 'minibuses', order: 4 },
      ],
    },
    {
      name: 'Cars / Campers / Caravans',
      slug: 'cars-campers',
      icon: 'car',
      order: 8,
      children: [
        { name: 'Cars', slug: 'cars', order: 1 },
        { name: 'Campers', slug: 'campers', order: 2 },
        { name: 'Caravans', slug: 'caravans', order: 3 },
      ],
    },
    {
      name: 'Containers',
      slug: 'containers',
      icon: 'box',
      order: 9,
      children: [
        { name: 'Shipping Containers', slug: 'shipping-containers', order: 1 },
        { name: 'Construction Containers', slug: 'construction-containers', order: 2 },
        { name: 'Tank Containers', slug: 'tank-containers', order: 3 },
        { name: 'Reefer Containers', slug: 'reefer-containers', order: 4 },
      ],
    },
    {
      name: 'Parts & Accessories',
      slug: 'parts-accessories',
      icon: 'wrench',
      order: 10,
      children: [
        { name: 'Truck Parts', slug: 'truck-parts', order: 1 },
        { name: 'Van Parts', slug: 'van-parts', order: 2 },
        { name: 'Equipment Parts', slug: 'equipment-parts', order: 3 },
        { name: 'Tyres & Wheels', slug: 'tyres-wheels', order: 4 },
      ],
    },
  ];

  for (const cat of categories) {
    const { children, ...parentData } = cat;

    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: parentData,
      create: parentData,
    });

    if (children) {
      for (const child of children) {
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: { ...child, parentId: parent.id },
          create: { ...child, parentId: parent.id },
        });
      }
    }
  }

  console.log('Categories seeded!');

  // Create admin user
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@menontrucks.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@menontrucks.com',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Admin user created: admin@menontrucks.com / admin123');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
