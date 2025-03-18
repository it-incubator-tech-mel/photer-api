import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../../infrastructure/device.repository';
import { Notification } from '../../../../../base/notification/notification';

export class TerminateAllOtherUserDevicesCommand {
  constructor(
    public readonly deviceId: string,
    public readonly userId: number,
  ) {}
}

@CommandHandler(TerminateAllOtherUserDevicesCommand)
export class TerminateAllOtherUserDevicesUseCase
  implements ICommandHandler<TerminateAllOtherUserDevicesCommand>
{
  constructor(
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async execute(command: TerminateAllOtherUserDevicesCommand): Promise<Notification> {
    const { deviceId, userId } = command;

    await this.deviceRepository.deleteAllOtherByDeviceIdAndUserId(
      deviceId,
      userId,
    );

    return Notification.success();
  }
}
