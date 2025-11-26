import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.carWash.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const owner = await prisma.user.create({
    data: {
      email: 'owner@carwash.com',
      name: 'John Owner',
      password: hashedPassword,
      role: 'OWNER',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@carwash.com',
      name: 'Jane Manager',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@carwash.com',
      name: 'Bob Staff',
      password: hashedPassword,
      role: 'STAFF',
    },
  });

  console.log(`✅ Created users: ${owner.email}, ${manager.email}, ${staff.email}`);

  // Create Car Washes
  console.log('🚗 Creating car washes...');
  const carWash1 = await prisma.carWash.create({
    data: {
      name: 'Sparkle Car Wash',
      address: '123 Main Street',
      city: 'New York',
      active: true,
    },
  });

  const carWash2 = await prisma.carWash.create({
    data: {
      name: 'Shine Auto Spa',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      active: true,
    },
  });

  const carWash3 = await prisma.carWash.create({
    data: {
      name: 'Crystal Clean',
      address: '789 Pine Road',
      city: 'Chicago',
      active: true,
    },
  });

  console.log(`✅ Created car washes: ${carWash1.name}, ${carWash2.name}, ${carWash3.name}`);

  // Create Services for Car Wash 1
  // Prices in cents. Wompi minimum: 150,000 cents (1,500.00 COP)
  console.log('🧼 Creating services...');
  const service1 = await prisma.service.create({
    data: {
      carWashId: carWash1.id,
      name: 'Basic Wash',
      price: 200000, // 2,000.00 COP (meets Wompi minimum)
      durationMin: 30,
      active: true,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      carWashId: carWash1.id,
      name: 'Premium Wash',
      price: 350000, // 3,500.00 COP
      durationMin: 45,
      active: true,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      carWashId: carWash1.id,
      name: 'Deluxe Wash + Wax',
      price: 500000, // 5,000.00 COP
      durationMin: 60,
      active: true,
    },
  });

  // Create Services for Car Wash 2
  const service4 = await prisma.service.create({
    data: {
      carWashId: carWash2.id,
      name: 'Express Wash',
      price: 150000, // 1,500.00 COP (Wompi minimum)
      durationMin: 20,
      active: true,
    },
  });

  const service5 = await prisma.service.create({
    data: {
      carWashId: carWash2.id,
      name: 'Full Service',
      price: 450000, // 4,500.00 COP
      durationMin: 75,
      active: true,
    },
  });

  // Create Services for Car Wash 3
  const service6 = await prisma.service.create({
    data: {
      carWashId: carWash3.id,
      name: 'Standard Wash',
      price: 250000, // 2,500.00 COP
      durationMin: 35,
      active: true,
    },
  });

  console.log(`✅ Created ${6} services`);

  // Create Bookings
  console.log('📅 Creating bookings...');
  const booking1 = await prisma.booking.create({
    data: {
      carWashId: carWash1.id,
      serviceId: service1.id,
      customerPhone: '+1234567890',
      date: new Date('2024-12-25T10:00:00Z'),
      status: 'PENDING_PAYMENT',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      carWashId: carWash1.id,
      serviceId: service2.id,
      customerPhone: '+1234567891',
      date: new Date('2024-12-25T14:00:00Z'),
      status: 'CONFIRMED',
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      carWashId: carWash2.id,
      serviceId: service4.id,
      customerPhone: '+1234567892',
      date: new Date('2024-12-26T09:00:00Z'),
      status: 'PENDING_PAYMENT',
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      carWashId: carWash3.id,
      serviceId: service6.id,
      customerPhone: '+1234567893',
      date: new Date('2024-12-27T11:00:00Z'),
      status: 'CONFIRMED',
    },
  });

  console.log(`✅ Created ${4} bookings`);

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('   Owner:   owner@carwash.com / password123');
  console.log('   Manager: manager@carwash.com / password123');
  console.log('   Staff:   staff@carwash.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

