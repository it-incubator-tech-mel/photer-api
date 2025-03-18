import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param, ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { RefreshTokenAuthGuard } from '../../../core/guards/refresh-token-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CurrentDeviceId } from '../../../core/decorators/param-decorators/current-device-id.decorator';
import {
  CurrentUserIdFromDevice
} from '../../../core/decorators/param-decorators/current-user-id-from-device.decorator';
import { DeviceOutputDto } from './dto/output/device-output.dto';
import { DevicesQueryRepository } from '../infrastructure/device.query-repository';
import { Notification, ResultStatus } from '../../../../base/notification/notification';
import { TerminateAllOtherUserDevicesCommand } from '../application/use-cases/terminate-all-other-user-devices.use-case';
import { TerminateUserDeviceCommand } from '../application/use-cases/terminate-user-device.use-case';
import { NotFoundException } from '../../../core/exception-filters/exceptions/exception-types';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('security/devices')
@UseGuards(RefreshTokenAuthGuard)
export class DeviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly devicesQueryRepository: DevicesQueryRepository,
  ) {}

  @Get()
  @ApiSecurity('refreshToken')
  @ApiOperation({ summary: 'Returns all devices with active sessions for current user' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: DeviceOutputDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserDevices(
    @CurrentUserIdFromDevice() userId: number,
  ) {
    const result: DeviceOutputDto[] = await this.devicesQueryRepository.findAll(userId);

    return result;
  }

  @Delete()
  @ApiSecurity('refreshToken')
  @ApiOperation({ summary: 'Terminate all other (exclude current) device\'s sessions' })
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateAllOtherUserDevices(
    @CurrentDeviceId() deviceId: string,
    @CurrentUserIdFromDevice() userId: number,
  ) {
    const result: Notification = await this.commandBus.execute<
      TerminateAllOtherUserDevicesCommand,
      Notification
    >(new TerminateAllOtherUserDevicesCommand(deviceId, userId));

    if (result.status === ResultStatus.Success) {
      return;
    }
  }

  @Delete(':deviceId')
  @ApiSecurity('refreshToken')
  @ApiOperation({ summary: 'Terminate specified device session' })
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'If try to delete the deviceId of other user' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateUserDevices(
    @Param('deviceId', new ParseUUIDPipe()) deviceId: string,
    @CurrentUserIdFromDevice() userId: number,
  ) {
    const result: Notification = await this.commandBus.execute<
      TerminateUserDeviceCommand,
      Notification
    >(new TerminateUserDeviceCommand(deviceId, userId));

    if (result.status === ResultStatus.NotFound) {
      throw new NotFoundException(result.errorMessage);
    } else if (result.status === ResultStatus.Forbidden) {
      throw new ForbiddenException(result.errorMessage);
    } else if (result.status === ResultStatus.Success) {
      return;
    }
  }
}
