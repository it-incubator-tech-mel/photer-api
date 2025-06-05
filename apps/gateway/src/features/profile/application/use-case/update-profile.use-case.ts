import { ProfileRepository } from '../../infrastructure/profile.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Profile } from '../../domain/profile.entity';
import {
  Notification,
  ResultStatus,
} from '../../../../../base/notification/notification';
import { User } from '../../../user/domain/user.entity';
import { UserService } from '../../../user/application/services/user.service';

export class UpdateProfileCommand {
  constructor(
    public readonly profileId: number,
    public readonly userId: number,
    public readonly username?: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly birthDate?: Date,
    public readonly country?: string,
    public readonly city?: string,
    public readonly aboutMe?: string,
  ) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileUseCase
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(
    private profileRepository: ProfileRepository,
    private readonly userService: UserService,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<Notification> {
    const {
      profileId,
      userId,
      username,
      firstName,
      lastName,
      birthDate,
      country,
      city,
      aboutMe,
    } = command;

    try {
      // 1. check profile exists
      const profile: Profile = await this.profileRepository.findById(profileId);
      if (!profile) {
        return Notification.notFound('Profile not found');
      }

      // 2. check post owner
      if (profile.getUserId() !== userId) {
        return Notification.forbidden('Not profile owner');
      }

      // 3. update username if passed
      if (username) {
        const usernameResult: Notification<User> =
          await this.userService.updateUsername(userId, username);

        if (usernameResult.status == ResultStatus.BadRequest) {
          return Notification.badRequest(usernameResult.extensions);
        } else if (usernameResult.status == ResultStatus.InternalError) {
          return Notification.internalError(usernameResult.errorMessage);
        }
      }

      // 4. check has changes
      const hasChanges: boolean =
        firstName !== undefined ||
        lastName !== undefined ||
        birthDate !== undefined ||
        country !== undefined ||
        city !== undefined ||
        aboutMe !== undefined;

      if (!hasChanges) {
        return Notification.success();
      }

      // 5. update profile
      profile.update(firstName, lastName, birthDate, country, city, aboutMe);

      await this.profileRepository.save(profile);
      return Notification.success();
    } catch (error) {
      return Notification.internalError('Failed to create profile');
    }
  }
}
