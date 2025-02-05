import { configModule } from '../../common/config/config-module';
import { Module } from '@nestjs/common';
import { AppController } from './features/app.controller';
import { AppService } from './features/app.service';
import { CoreConfig } from './config/core.config';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';
import { PrismaModule } from './prisma/prisma.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    configModule,
    DatabaseModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: CoreConfig,
      useFactory: (configService: ConfigService<any, true>) => new CoreConfig(configService),
      inject: [ConfigService],
    },
    // {
    //   provide: DatabaseConfig,
    //   useFactory: (configService: ConfigService<any, true>) => new DatabaseConfig(configService),
    //   inject: [ConfigService],
    // }
  ],
})
export class AppModule {}
