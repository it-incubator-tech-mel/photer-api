import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Модуль для управления подписками пользователей
 *
 * Включает:
 * - Создание и управление подписками
 * - Платежные операции
 * - Автопродление подписок
 * - История платежей
 */
@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PrismaService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
