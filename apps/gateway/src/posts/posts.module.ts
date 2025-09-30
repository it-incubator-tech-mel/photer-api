import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Модуль для управления постами пользователей
 *
 * Включает:
 * - Создание и обновление постов
 * - Просмотр публичных постов
 * - Загрузка фотографий
 * - Управление постами пользователей
 */
@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
  exports: [PostsService],
})
export class PostsModule {}
