import { Module } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtServiceProvider } from './jwt-service-provider.service';
import { ConfigModule } from '../../config/config.module';

@Module({
  providers: [NestJwtService, ConfigModule],
  exports: [JwtServiceProvider],
})
export class JwtModule {}