import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  const hashedPassword = await bcrypt.hash('testpassword', 10);

  try {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        phoneNumber: '1234567890',
        userType: 'BENEFICIARY_INDIVIDUAL',
      },
    });

    console.log('Test user created:', user);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

