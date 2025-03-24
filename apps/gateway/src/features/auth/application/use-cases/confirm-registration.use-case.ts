import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Notification } from '../../../../../base/notification/notification';
import { User } from '../../domain/user.entity';
import { UserRepository } from '../../infrastructure/users.repository';

export class ConfirmRegistrationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: ConfirmRegistrationCommand): Promise<Notification> {
    const { code } = command;

    const existingUser: User =
      await this.userRepository.findByConfirmationCode(code);

    if (!existingUser) {
      return Notification.badRequest([
        {
          message: 'Invalid confirmation code',
          field: 'code',
        },
      ]);
    }

    if (existingUser.getConfirmationExpiration() < new Date()) {
      return Notification.badRequest([
        {
          message: 'Confirmation code has expired',
          field: 'code',
        },
      ]);
    }

    try {
      existingUser.confirmEmail();
      await this.userRepository.updateConfirmation(existingUser);
    } catch (error) {
      return Notification.badRequest([
        { message: error.message, field: 'code' },
      ]);
    }

    return Notification.success();
  }
}
