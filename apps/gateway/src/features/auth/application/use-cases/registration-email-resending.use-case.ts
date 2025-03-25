import { MailerService } from '../../../../core/services/mailler/mailer.service';
import {
  registrationEmailTemplate,
} from '../../../../core/services/mailler/email-templates/registration-email-template';
import { CoreConfig } from '../../../../core/config/core.config';
import { Notification, ResultStatus } from '../../../../../base/notification/notification';
import { randomUUID } from 'crypto';
import { User } from '../../domain/user.entity';
import { add } from 'date-fns';
import { CommandHandler } from '@nestjs/cqrs/dist/decorators/command-handler.decorator';
import { ICommandHandler } from '@nestjs/cqrs/dist/interfaces/commands/command-handler.interface';
import { UserRepository } from '../../infrastructure/users.repository';

export class RegistrationEmailResendingCommand {
  constructor(public readonly email: string) {
  }
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly coreConfig: CoreConfig,
  ) {
  }

  async execute(command: RegistrationEmailResendingCommand): Promise<Notification> {
    const { email } = command;
    const user: User = await this.userRepository.findByEmail(email);

    if (!user) {
      return Notification.badRequest([
        { message: `User with email ${email} does not exist`, field: 'email' },
      ]);
    }

    try {
      this.resendConfirmation(user);
      await this.userRepository.updateConfirmation(user);
    } catch (error) {
      return Notification.badRequest([{ message: error.message, field: 'email' }]);
    }

    this.mailerService.sendEmail(
      email,
      registrationEmailTemplate(user.getConfirmationCode(), this.coreConfig.baseUrl),
      'Registration Confirmation',
    );

    return { status: ResultStatus.Success, data: null };
  }

  private resendConfirmation(user: User): void {
    if (user.isEmailConfirmed()) {
      throw new Error('Email already confirmed');
    }

    user.updateConfirmationCode(randomUUID(), add(new Date(), { hours: 1, minutes: 30 }));
  }
}