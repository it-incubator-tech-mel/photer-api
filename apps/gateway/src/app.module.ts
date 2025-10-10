import { AuthModule } from './features/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PostsModule } from './features/content/post/posts.module';
import { ProfileModule } from './features/profile/profile.module';
import { DeviceModule } from './features/device/device.module';
import { SubscriptionModule } from './features/subscription/subscription.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    ScheduleModule.forRoot(),
    AuthModule,
    ProfileModule,
    DeviceModule,
    PostsModule,
    SubscriptionModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 5,
          ttl: 60000,
        },
      ],
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
