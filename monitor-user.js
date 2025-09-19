const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorUser(email) {
  try {
    console.log(`🔍 Monitoring user: ${email}`);
    console.log(`⏰ Started at: ${new Date()}`);
    console.log('─'.repeat(50));

    let lastStatus = null;

    // Функция для проверки пользователя
    const checkUser = async () => {
      try {
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
          console.log(`❌ User not found: ${email}`);
          return;
        }

        const currentStatus = {
          emailConfirmed: user.emailConfirmed,
          hasConfirmationCode: !!user.confirmationCode,
          confirmationExpired: user.confirmationExpires
            ? new Date() > user.confirmationExpires
            : false,
          timestamp: new Date(),
        };

        // Проверяем, изменился ли статус
        if (
          !lastStatus ||
          JSON.stringify(currentStatus) !== JSON.stringify(lastStatus)
        ) {
          console.log(
            `\n🔄 Status changed at ${new Date().toLocaleTimeString()}:`,
          );
          console.log(`👤 User: ${user.username} (${user.email})`);
          console.log(`🆔 ID: ${user.id}`);
          console.log(
            `✅ Email Confirmed: ${user.emailConfirmed ? 'Yes' : 'No'}`,
          );
          console.log(
            `🔑 Confirmation Code: ${user.confirmationCode || 'None'}`,
          );
          console.log(
            `⏰ Confirmation Expires: ${user.confirmationExpires || 'None'}`,
          );
          console.log(
            `⏰ Code Expired: ${currentStatus.confirmationExpired ? 'Yes' : 'No'}`,
          );
          console.log(`📅 Created: ${user.createdAt}`);
          console.log(`📅 Updated: ${user.updatedAt}`);

          if (user.emailConfirmed) {
            console.log(`🎉 SUCCESS: User email is now confirmed!`);
          } else if (currentStatus.confirmationExpired) {
            console.log(`⚠️ WARNING: Confirmation code has expired!`);
          } else if (user.confirmationCode) {
            console.log(
              `⏳ WAITING: User needs to confirm email with code: ${user.confirmationCode}`,
            );
          }

          lastStatus = currentStatus;
        } else {
          // Показываем текущий статус каждые 10 секунд
          const now = new Date();
          if (!lastStatus || now - lastStatus.timestamp > 10000) {
            console.log(
              `\n⏰ Status check at ${now.toLocaleTimeString()}: Email confirmed: ${user.emailConfirmed ? 'Yes' : 'No'}`,
            );
            lastStatus = currentStatus;
          }
        }
      } catch (error) {
        console.error(`❌ Error checking user:`, error);
      }
    };

    // Первая проверка
    await checkUser();

    // Мониторинг каждые 2 секунды
    const interval = setInterval(checkUser, 2000);

    // Остановка через 5 минут
    setTimeout(
      () => {
        clearInterval(interval);
        console.log('\n⏰ Monitoring stopped after 5 minutes');
        process.exit(0);
      },
      5 * 60 * 1000,
    );

    // Обработка Ctrl+C
    process.on('SIGINT', () => {
      clearInterval(interval);
      console.log('\n⏰ Monitoring stopped by user');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error in monitorUser:', error);
  } finally {
    // Не закрываем соединение, так как мониторим
  }
}

// Получаем email из аргументов командной строки
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node monitor-user.js <email>');
  console.log('Example: node monitor-user.js farhodmuhamadiev4@gmail.com');
  process.exit(1);
}

monitorUser(email);
