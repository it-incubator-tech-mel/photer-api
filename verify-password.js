const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function verifyPassword(email, password) {
  try {
    console.log(`🔍 Verifying password for user: ${email}`);

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        emailConfirmed: true,
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`👤 Found user: ${user.username}`);
    console.log(`✅ Email Confirmed: ${user.emailConfirmed ? 'Yes' : 'No'}`);

    if (!user.emailConfirmed) {
      console.log('❌ User email is not confirmed. Cannot verify password.');
      return;
    }

    // Проверяем пароль
    console.log('🔐 Verifying password...');
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      console.log('✅ Password is correct!');
      console.log(`👤 User ${user.username} can log in successfully`);
    } else {
      console.log('❌ Password is incorrect!');
      console.log(`👤 User ${user.username} cannot log in with this password`);
    }

    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password provided: ${password}`);
    console.log(`🔐 Password match: ${passwordMatch ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error('❌ Error verifying password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Получаем параметры из аргументов командной строки
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('❌ Please provide both email and password');
  console.log('Usage: node verify-password.js <email> <password>');
  console.log(
    'Example: node verify-password.js farhodmuhamadiev4@gmail.com password123',
  );
  process.exit(1);
}

verifyPassword(email, password);
