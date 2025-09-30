import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SecurityService } from './security.service';

/**
 * Контроллер для управления безопасностью и устройствами
 *
 * Обеспечивает API для:
 * - Просмотра активных сессий пользователя
 * - Завершения сессий на других устройствах
 * - Управления безопасностью аккаунта
 */
@ApiTags('Device')
@Controller('api/v1/security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  /**
   * Получение всех устройств с активными сессиями для текущего пользователя
   *
   * @param req - Запрос с информацией о пользователе
   * @returns Список устройств с активными сессиями
   */
  @Get('devices')
  @ApiOperation({
    summary: 'Returns all devices with active sessions for current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active devices',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', example: 'device-1' },
          title: { type: 'string', example: 'Chrome on Windows' },
          lastActiveDate: { type: 'string', format: 'date-time' },
          ip: { type: 'string', example: '192.168.1.100' },
        },
      },
    },
  })
  async getActiveDevices(@Request() req: any) {
    // TODO: Получить userId из JWT токена
    const userId = req.user?.id || 'temp-user-id';
    return this.securityService.getActiveDevices(userId);
  }

  /**
   * Завершение всех других сессий (исключая текущую)
   *
   * @param req - Запрос с информацией о пользователе
   * @returns Результат операции
   */
  @Delete('devices')
  @ApiOperation({
    summary: 'Terminate all other (exclude current) device sessions',
  })
  @ApiResponse({
    status: 200,
    description: 'All other sessions terminated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        terminatedCount: { type: 'number' },
      },
    },
  })
  async terminateAllOtherSessions(@Request() req: any) {
    // TODO: Получить userId и currentDeviceId из JWT токена
    const userId = req.user?.id || 'temp-user-id';
    const currentDeviceId = req.user?.deviceId || 'current-device';
    return this.securityService.terminateAllOtherSessions(
      userId,
      currentDeviceId,
    );
  }

  /**
   * Завершение конкретной сессии
   *
   * @param deviceId - ID устройства для завершения
   * @param req - Запрос с информацией о пользователе
   * @returns Результат операции
   */
  @Delete('devices/:deviceId')
  @ApiOperation({ summary: 'Terminate specified device session' })
  @ApiParam({ name: 'deviceId', description: 'ID of device to terminate' })
  @ApiResponse({
    status: 200,
    description: 'Device session terminated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deviceId: { type: 'string' },
      },
    },
  })
  async terminateDeviceSession(
    @Param('deviceId') deviceId: string,
    @Request() req: any,
  ) {
    // TODO: Получить userId из JWT токена
    const userId = req.user?.id || 'temp-user-id';
    return this.securityService.terminateDeviceSession(userId, deviceId);
  }
}
