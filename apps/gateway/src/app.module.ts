import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SecurityModule } from './security/security.module';
import { ProfileModule } from './profile/profile.module'; // Раскомментировано
import { PostsModule } from './posts/posts.module'; // Добавлен Posts модуль
import { SubscriptionsModule } from './subscriptions/subscriptions.module'; // Добавлен Subscriptions модуль

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    AuthModule,
    UsersModule,
    SecurityModule,
    ProfileModule, // Раскомментировано
    PostsModule, // Добавлен Posts модуль
    SubscriptionsModule, // Добавлен Subscriptions модуль
  ],
})
export class AppModule {}
