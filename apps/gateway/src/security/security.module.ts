import { Module } from '@nestjs/common';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Модуль для управления безопасностью и устройствами
 *
 * Включает:
 * - Управление активными сессиями пользователей
 * - Завершение сессий на других устройствах
 * - Мониторинг устройств с активными сессиями
 */
@Module({
  controllers: [SecurityController],
  providers: [SecurityService, PrismaService],
  exports: [SecurityService],
})
export class SecurityModule {}
