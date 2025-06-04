import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import {
  Notification,
  ResultStatus,
} from '../../../../../base/notification/notification';
import { Profile } from '../../domain/profile.entity';
import { UserService } from '../../../user/application/services/user.service';
import { User } from '../../../user/domain/user.entity';

export class CreateProfileCommand {
  constructor(
    public readonly userId: number,
    public readonly username: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly birthDate?: Date,
    public readonly country?: string,
    public readonly city?: string,
    public readonly aboutMe?: string,
  ) {}
}

@CommandHandler(CreateProfileCommand)
export class CreateProfileUseCase
  implements ICommandHandler<CreateProfileCommand>
{
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly userService: UserService,
  ) {}

  async execute(command: CreateProfileCommand): Promise<Notification<number>> {
    const {
      userId,
      username,
      firstName,
      lastName,
      birthDate,
      country,
      city,
      aboutMe,
    } = command;

    // 1. check profile already exists
    const existingProfile: Profile =
      await this.profileRepository.findByUserId(userId);

    if (existingProfile) {
      return Notification.badRequest([
        {
          message: 'Profile already exists',
          field: 'username',
        },
      ]);
    }

    // 2. update username
    const usernameResult: Notification<User> =
      await this.userService.updateUsername(userId, username);

    if (usernameResult.status == ResultStatus.BadRequest) {
      return Notification.badRequest(usernameResult.extensions);
    } else if (usernameResult.status == ResultStatus.InternalError) {
      return Notification.internalError(usernameResult.errorMessage);
    }

    // 3. create profile
    let profile: Profile;
    try {
      profile = Profile.create(
        userId,
        firstName,
        lastName,
        birthDate,
        country,
        city,
        aboutMe,
      );

      const savedProfile: Profile = await this.profileRepository.save(profile);
      return Notification.success(savedProfile.getId());
    } catch (error) {
      return Notification.internalError('Failed to create profile');
    }
  }
}
