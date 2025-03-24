import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Device } from '../../domain/device.entity';
import { DeviceRepository } from '../../infrastructure/device.repository';
import { Notification } from '../../../../../base/notification/notification';

export class TerminateUserDeviceCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: number,
  ) {}
}

@CommandHandler(TerminateUserDeviceCommand)
export class TerminateUserDeviceUseCase
  implements ICommandHandler<TerminateUserDeviceCommand>
{
  constructor(private readonly deviceRepository: DeviceRepository) {}

  async execute(command: TerminateUserDeviceCommand): Promise<Notification> {
    const { deviceId, userId } = command;

    const device: Device | null =
      await this.deviceRepository.findByDeviceId(deviceId);

    if (!device) {
      return Notification.notFound(`Device with id ${deviceId} does not exist`);
    }

    if (device.getUserId() !== userId) {
      return Notification.forbidden(
        `You do not have permission to delete this device`,
      );
    }

    await this.deviceRepository.deleteOneByDeviceIdAndUserId(deviceId, userId);

    return Notification.success();
  }
}
