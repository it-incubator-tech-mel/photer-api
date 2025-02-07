import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';

@Module({
  imports: [CqrsModule],
  controllers: [AuthController],
  exports: []
})
export class AuthModule {}