import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../../devices/infrastructure/device.repository';
import { Notification } from '../../../../core/notification/notification';

export class LogoutCommand {
  constructor(
    public readonly deviceId: string,
    public readonly iat: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<Notification> {
    const { deviceId, iat } = command;

    const isDeleted: boolean =
      await this.deviceRepository.deleteOneByDeviceIdAndIAt(
        deviceId,
        iat,
      );

    // const validToken = await this.refreshTokenRepo.delete(command.refreshToken);

    if (!isDeleted) return Notification.unauthorized('Invalid or expired token')

    return Notification.success();
  }
}