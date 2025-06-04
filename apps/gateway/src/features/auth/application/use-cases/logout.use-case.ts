import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Notification } from '../../../../../base/notification/notification';
import { DeviceRepository } from '../../../device/infrastructure/device.repository';

export class LogoutCommand {
  constructor(
    public readonly deviceId: string,
    public readonly iat: string,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async execute(command: LogoutCommand): Promise<Notification> {
    const { deviceId, iat } = command;

    const isDeleted: boolean =
      await this.deviceRepository.deleteOneByDeviceIdAndIAt(deviceId, iat);

    if (!isDeleted)
      return Notification.unauthorized('Invalid or expired token');

    return Notification.success();
  }
}
