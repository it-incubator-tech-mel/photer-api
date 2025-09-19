const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAuthFlow(email, password) {
  try {
    console.log(`🧪 Testing authentication flow for: ${email}`);
    console.log('─'.repeat(60));

    // Шаг 1: Проверяем текущее состояние пользователя
    console.log('\n📋 STEP 1: Checking current user status');
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        emailConfirmed: true,
        confirmationCode: true,
        confirmationExpires: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log(`👤 User: ${user.username} (${user.email})`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`✅ Email Confirmed: ${user.emailConfirmed ? 'Yes' : 'No'}`);
    console.log(`🔑 Confirmation Code: ${user.confirmationCode || 'None'}`);
    console.log(
      `⏰ Confirmation Expires: ${user.confirmationExpires || 'None'}`,
    );

    if (user.confirmationExpires) {
      const isExpired = new Date() > user.confirmationExpires;
      console.log(`⏰ Code Expired: ${isExpired ? 'Yes' : 'No'}`);
    }

    // Шаг 2: Если email не подтвержден, проверяем код
    if (!user.emailConfirmed && user.confirmationCode) {
      console.log(
        '\n📋 STEP 2: Email not confirmed, checking confirmation code',
      );

      if (user.confirmationExpires && new Date() > user.confirmationExpires) {
        console.log('❌ Confirmation code has expired!');
        console.log(
          '💡 Solution: User needs to request a new confirmation code',
        );
        return;
      }

      console.log('✅ Confirmation code is still valid');
      console.log(
        `💡 Solution: User should use code: ${user.confirmationCode}`,
      );

      // Шаг 3: Симулируем подтверждение email
      console.log('\n📋 STEP 3: Simulating email confirmation');
      console.log('🔄 Updating user emailConfirmed to true...');

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailConfirmed: true,
          confirmationCode: null,
          confirmationExpires: null,
        },
      });

      console.log('✅ Email confirmed successfully!');

      // Шаг 4: Проверяем результат
      console.log('\n📋 STEP 4: Verifying confirmation result');
      const updatedUser = await prisma.user.findUnique({
        where: { email },
        select: {
          emailConfirmed: true,
          confirmationCode: true,
          confirmationExpires: true,
          updatedAt: true,
        },
      });

      console.log(
        `✅ Email Confirmed: ${updatedUser.emailConfirmed ? 'Yes' : 'No'}`,
      );
      console.log(
        `🔑 Confirmation Code: ${updatedUser.confirmationCode || 'None'}`,
      );
      console.log(
        `⏰ Confirmation Expires: ${updatedUser.confirmationExpires || 'None'}`,
      );
      console.log(`📅 Updated At: ${updatedUser.updatedAt}`);

      if (updatedUser.emailConfirmed) {
        console.log('\n🎉 SUCCESS: User can now log in!');
        console.log('💡 Next step: Try logging in with email and password');
      }
    } else if (user.emailConfirmed) {
      console.log('\n✅ User email is already confirmed!');
      console.log('💡 User should be able to log in');
    } else {
      console.log('\n❌ User has no confirmation code');
      console.log(
        '💡 Solution: User needs to register again or request confirmation code',
      );
    }
  } catch (error) {
    console.error('❌ Error in testAuthFlow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Получаем параметры из аргументов командной строки
const email = process.argv[2];
const password = process.argv[3];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node test-auth-flow.js <email> [password]');
  console.log(
    'Example: node test-auth-flow.js farhodmuhamadiev4@gmail.com mypassword',
  );
  process.exit(1);
}

testAuthFlow(email, password);
