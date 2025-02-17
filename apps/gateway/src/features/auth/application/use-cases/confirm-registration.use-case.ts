import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../infrastructure/users.repository';
import { Notification } from '../../../../core/notification/notification';

export class ConfirmRegistrationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase
  implements ICommandHandler<ConfirmRegistrationCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: ConfirmRegistrationCommand): Promise<Notification> {
    const { code } = command;

    const existingUser =
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
      await this.userRepository.save(existingUser);
    } catch (error) {
      return Notification.badRequest([
        { message: error.message, field: 'code' },
      ]);
    }

    return Notification.success();
  }
}
