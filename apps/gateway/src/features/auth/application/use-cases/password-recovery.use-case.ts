import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../users/infrastructure/user.repository';
import { MailerService } from '../../../../core/services/mailler/mailer.service';
import { Notification } from '../../../../../base/notification/notification';
import { User } from '../../../users/domain/user.entity';
import { CoreConfig } from '../../../../core/config/core.config';
import { passwordRecoveryEmailTemplate } from '../../../../core/services/mailler/email-templates/password-recovery-email-template';

export class PasswordRecoveryUseCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryUseCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryUseCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly coreConfig: CoreConfig,
  ) {}

  async execute(command: PasswordRecoveryUseCommand): Promise<Notification> {
    const { email } = command;

    const user: User = await this.userRepository.findByEmail(email);
    if (!user) return Notification.notFound('User not found');

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
