import { AuthModule } from './features/auth/auth.module';
import { DeviceModule } from './features/devices/device.module';
import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PostsModule } from './features/content/post/posts.module';
import { ProfileModule } from './features/profile/profile.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    ProfileModule,
    DeviceModule,
    PostsModule,
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
