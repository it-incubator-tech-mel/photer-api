import { configModule } from '../../common/config/config.module';
import { Module } from '@nestjs/common';
import { CoreConfig } from './core/config/core.config';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './features/auth/auth.module';
import { DeviceModule } from './features/devices/device.module';

@Module({
  imports: [
    configModule,
    AuthModule,
    DeviceModule
  ],
  controllers: [],
  providers: [
    {
      provide: CoreConfig,
      useFactory: (configService: ConfigService<any, true>) => new CoreConfig(configService),
      inject: [ConfigService],
    }
  ],
})
export class AppModule {}
