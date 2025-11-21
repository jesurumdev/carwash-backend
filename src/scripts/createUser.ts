import bcrypt from 'bcrypt';
import prisma from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

async function createUser() {
  const email = process.argv[2] || 'test@example.com';
  const password = process.argv[3] || 'password123';
  const name = process.argv[4] || 'Test User';
  const role = process.argv[5] || 'OWNER';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    console.log('User created successfully!');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
    console.log('\nYou can now login with:');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('Error: User with this email already exists');
    } else {
      console.error('Error creating user:', error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();

