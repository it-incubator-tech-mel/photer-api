const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function confirmUserEmail(email) {
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
        confirmationCode: true,
        confirmationExpires: true,
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`👤 Found user: ${user.username}`);
    console.log(
      `   Email Confirmed: ${user.emailConfirmed ? '✅ Yes' : '❌ No'}`,
    );

    if (user.emailConfirmed) {
      console.log('✅ User email is already confirmed');
      return;
    }

    if (!user.confirmationCode) {
      console.log('❌ No confirmation code found');
      return;
    }

    if (user.confirmationExpires && new Date() > user.confirmationExpires) {
      console.log('❌ Confirmation code has expired');
      return;
    }

    // Подтверждаем email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmed: true,
        confirmationCode: null,
        confirmationExpires: null,
      },
    });

    console.log('✅ User email confirmed successfully!');
    console.log(`   User ${user.username} can now log in`);
  } catch (error) {
    console.error('❌ Error confirming user email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Получаем email из аргументов командной строки
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node confirm-user-email.js <email>');
  process.exit(1);
}

confirmUserEmail(email);
