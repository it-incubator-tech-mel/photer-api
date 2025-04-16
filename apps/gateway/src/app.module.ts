import { AuthModule } from './features/auth/auth.module';
import { DeviceModule } from './features/devices/device.module';
import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PostsModule } from './features/posts/posts.module';
import { PhotoModule } from './features/photo/photo.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    PhotoModule,
    AuthModule,
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
