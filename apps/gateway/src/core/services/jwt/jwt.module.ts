import { Module } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtService } from './jwt.service';
import { ConfigModule } from '../../config/config.module';

@Module({
  providers: [NestJwtService, ConfigModule],
  exports: [JwtService],
})
export class JwtModule {}