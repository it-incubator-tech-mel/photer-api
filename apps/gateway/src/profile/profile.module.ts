import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Модуль для управления профилями пользователей
 *
 * Включает:
 * - Создание и обновление профилей
 * - Просмотр публичных профилей
 * - Загрузка аватаров
 * - Управление личной информацией
 */
@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService],
  exports: [ProfileService],
})
export class ProfileModule {}
