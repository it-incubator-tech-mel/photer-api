import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';

/**
 * Контроллер для работы с пользователями
 *
 * Реализация в соответствии с Photer API 1.0
 */
@ApiTags('User')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Получение общего количества пользователей
   *
   * Возвращает общее количество зарегистрированных пользователей в системе
   */
  @Get('count')
  @ApiOperation({ summary: 'Get total users count' })
  @ApiResponse({
    status: 200,
    description: 'Returns total count of users',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Total number of users',
          example: 42,
        },
      },
    },
  })
  async getUsersCount() {
    const count = await this.usersService.getUsersCount();
    return { count };
  }
}
