import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../infrastructure/users.repository';
import { MailerService } from '../../../../core/services/mailler/mailer.service';
import { Result } from '../../../../../base/object-result';
import { Notification } from '../../../../core/notification/notification';
import { User } from '../../domain/user.entity';
import { CoreConfig } from '../../../../core/config/core.config';
import {
  passwordRecoveryEmailTemplate
} from '../../../../core/services/mailler/email-templates/password-recovery-email-template';

export class PasswordRecoveryUseCommand {
  constructor(
    public readonly email: string,
    ) {
  }
}

@CommandHandler(PasswordRecoveryUseCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryUseCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly coreConfig: CoreConfig,
  ) {
  }

  async execute(command: PasswordRecoveryUseCommand): Promise<Notification> {
    const { email } = command;
    const user: User = await this.userRepository.findByEmail(email);
    if (!user) return Result.unauthorized();

    // const generateRecoveryCode = randomUUID();
    // const createPasswordRecoveryCodeBody = PasswordRecovery.createForUser(existingUser.getId(), generateRecoveryCode);

    user.requestPasswordRecovery();

    await this.userRepository.updatePasswordRecovery(user)
    // await this.userRepository.updateRecoveryCodeByEmailOrSave(createPasswordRecoveryCodeBody);

    this.mailerService.sendEmail(
      email,
      passwordRecoveryEmailTemplate(
        user.getRecoveryCode(),
        this.coreConfig.baseUrl
      ),
      'Password Recovery',
    );

    // await this.mailerService.sendEmail(
    //   email,
    //   generateRecoveryCode,
    //   'password recovery'
    // );

    return Result.success();
    // return true;
  }

}
