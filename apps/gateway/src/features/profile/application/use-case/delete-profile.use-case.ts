import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { Profile } from '../../domain/profile.entity';
import { Notification } from '../../../../../base/notification/notification';

export class DeleteProfileCommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(DeleteProfileCommand)
export class DeleteProfileUseCase
  implements ICommandHandler<DeleteProfileCommand>
{
  constructor(private readonly profileRepository: ProfileRepository) {}
  async execute(command: DeleteProfileCommand): Promise<Notification> {
    const { userId } = command;

    const profile: Profile | null =
      await this.profileRepository.findByUserId(userId);

    if (!profile) {
      return Notification.notFound('Profile not found');
    }

    await this.profileRepository.softDelete(profile.getId());
    return Notification.success();
  }
}
