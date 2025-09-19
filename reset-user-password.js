const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetUserPassword(email, newPassword) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
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
      console.log('❌ User email is not confirmed. Cannot reset password.');
      return;
    }

    // Хешируем новый пароль
    console.log('🔄 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hashed successfully');

    // Обновляем пароль
    console.log('🔄 Updating user password...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    console.log('✅ Password updated successfully!');
    console.log(`👤 User ${user.username} can now log in with new password`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 New password: ${newPassword}`);
  } catch (error) {
    console.error('❌ Error resetting user password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Получаем параметры из аргументов командной строки
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('❌ Please provide both email and new password');
  console.log('Usage: node reset-user-password.js <email> <new-password>');
  console.log(
    'Example: node reset-user-password.js farhodmuhamadiev4@gmail.com mynewpassword123',
  );
  process.exit(1);
}

resetUserPassword(email, newPassword);
