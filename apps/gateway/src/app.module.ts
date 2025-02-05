import { configModule } from '../../common/config/config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreConfig } from './config/core.config';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    configModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: CoreConfig,
      useFactory: (configService: ConfigService<any, true>) => new CoreConfig(configService),
      inject: [ConfigService],
    }
  ],
})
export class AppModule {}
