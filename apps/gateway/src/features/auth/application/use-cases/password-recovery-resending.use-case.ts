import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../infrastructure/users.repository';
import { MailerService } from '../../../../core/services/mailler/mailer.service';
import { CoreConfig } from '../../../../core/config/core.config';
import { Notification } from '../../../../../base/notification/notification';
import {
  passwordRecoveryEmailTemplate
} from '../../../../core/services/mailler/email-templates/password-recovery-email-template';
import { User } from '../../domain/user.entity';

export class PasswordRecoveryResendingCommand {
  constructor(
    public readonly email: string
  ) {}
}

@CommandHandler(PasswordRecoveryResendingCommand)
export class ResendRecoveryLinkUseCase implements ICommandHandler<PasswordRecoveryResendingCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly coreConfig: CoreConfig,
  ) {}

  async execute(command: PasswordRecoveryResendingCommand): Promise<Notification> {
    const { email } = command;
    const user: User = await this.userRepository.findByEmail(email);
    if (!user) return Notification.notFound('User with this email does not exist');

    user.requestPasswordRecovery();
    await this.userRepository.updateOrCreatePasswordRecovery(user);

    this.mailerService.sendEmail(
      email,
      passwordRecoveryEmailTemplate(
        user.getRecoveryCode(),
        this.coreConfig.baseUrl,
      ),
      'Password Recovery',
    );

    return Notification.success();
  }
}