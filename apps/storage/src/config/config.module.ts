import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config';
import { YandexConfig } from './Yandex-config';
import { CoreTpcConfig } from './core.tpc.config';

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
      provide: YandexConfig,
      useFactory: (configService: ConfigService<any, true>) =>
        new YandexConfig(configService),
      inject: [ConfigService],
    },
    {
      provide: CoreTpcConfig,
      useFactory: (configService: ConfigService<any, true>) =>
        new CoreTpcConfig(configService),
      inject: [ConfigService],
    },
  ],
  exports: [YandexConfig, CoreTpcConfig],
})
export class ConfigTPCModule {}
