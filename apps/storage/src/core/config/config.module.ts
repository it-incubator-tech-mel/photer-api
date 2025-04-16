import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config';
import { CoreConfig } from './core.config';
import { S3ClientConfig } from './s3-client.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [
        process.env.ENV_FILE_PATH?.trim() || '',
        `.env.${process.env.ENV_TYPE}.local`,
        `.env.${process.env.ENV_TYPE}`,
        '.env.production',
      ],
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: CoreConfig,
      useFactory: (configService: ConfigService<any, true>) =>
        new CoreConfig(configService),
      inject: [ConfigService],
    },
    {
      provide: S3ClientConfig,
      useFactory: (configService: ConfigService<any, true>) =>
        new S3ClientConfig(configService),
      inject: [ConfigService],
    },
  ],
  exports: [S3ClientConfig, CoreConfig],
})
export class ConfigModule {}
