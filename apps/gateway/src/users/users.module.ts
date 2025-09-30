import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Модуль для работы с пользователями
 *
 * Минимальная реализация для поддержки auth функционала.
 * В дальнейшем будет расширен в соответствии с Production API.
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
