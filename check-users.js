const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');

    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        emailConfirmed: true,
        confirmationCode: true,
        confirmationExpires: true,
        createdAt: true,
      },
    });

    console.log(`📊 Found ${users.length} users:`);

    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(
        `   Email Confirmed: ${user.emailConfirmed ? '✅ Yes' : '❌ No'}`,
      );
      console.log(`   Confirmation Code: ${user.confirmationCode || 'None'}`);
      console.log(
        `   Confirmation Expires: ${user.confirmationExpires || 'None'}`,
      );
      console.log(`   Created: ${user.createdAt}`);
    });

    // Проверяем конкретного пользователя
    const specificUser = await prisma.user.findUnique({
      where: { email: 'farhodmuhamadiev4@gmail.com' },
      select: {
        id: true,
        username: true,
        email: true,
        emailConfirmed: true,
        confirmationCode: true,
        confirmationExpires: true,
        createdAt: true,
      },
    });

    if (specificUser) {
      console.log('\n🎯 Specific user (farhodmuhamadiev4@gmail.com):');
      console.log(`   ID: ${specificUser.id}`);
      console.log(`   Username: ${specificUser.username}`);
      console.log(
        `   Email Confirmed: ${specificUser.emailConfirmed ? '✅ Yes' : '❌ No'}`,
      );
      console.log(
        `   Confirmation Code: ${specificUser.confirmationCode || 'None'}`,
      );
      console.log(
        `   Confirmation Expires: ${specificUser.confirmationExpires || 'None'}`,
      );

      if (!specificUser.emailConfirmed) {
        console.log('\n⚠️  This user needs email confirmation!');
        console.log(`   Confirmation Code: ${specificUser.confirmationCode}`);
        console.log(`   Expires: ${specificUser.confirmationExpires}`);

        if (
          specificUser.confirmationExpires &&
          new Date() > specificUser.confirmationExpires
        ) {
          console.log('❌ Confirmation code has expired!');
        } else {
          console.log('✅ Confirmation code is still valid');
        }
      }
    } else {
      console.log('\n❌ User farhodmuhamadiev4@gmail.com not found');
    }
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
