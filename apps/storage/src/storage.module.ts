import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config/config.module';
import { CoreConfig } from './config/core.config';
import { AvatarModule } from './features/avatar/avatar.module';
import { PostPhotoModule } from './features/post-photo/post-photo.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      useFactory: async (config: CoreConfig) => ({
        uri: config.mongoUrl,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [CoreConfig],
    }),
    AvatarModule,
    PostPhotoModule,
  ],
  controllers: [],
  providers: [],
})
export class StorageModule {}
