import { Injectable } from '@nestjs/common';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../infrastructure/user.repository';
import { Notification } from '../../../../../base/notification/notification';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async updateUsername(
    userId: number,
    newUsername: string,
  ): Promise<Notification<User>> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return Notification.badRequest([
          {
            message: 'User not found',
            field: 'username',
          },
        ]);
      }

      // check user has the same value
      if (user.getUsername() === newUsername) {
        return Notification.success(user);
      }

      // check unique - other user has the same username
      const existing: User =
        await this.userRepository.findByUsername(newUsername);
      if (existing && existing.getId() !== userId) {
        return Notification.badRequest([
          {
            message: 'Username already taken',
            field: 'username',
          },
        ]);
      }

      // update username domain and in db
      const wasUpdated: boolean = user.updateUsername(newUsername);
      if (wasUpdated) {
        await this.userRepository.update(user);
      }

      return Notification.success(user);
    } catch (error) {
      return Notification.internalError('Failed to update username');
    }
  }

  async upgradeToBusinessAccount(userId: number) {
    await this.userRepository.updateUserAccountType(userId, 'BUSINESS');
  }
}
