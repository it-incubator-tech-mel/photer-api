import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '../../../../core/services/mailler/mailer.service';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import { Notification } from '../../../../../base/notification/notification';
import { CoreConfig } from '../../../../core/config/core.config';
import { UserRepository } from '../../../user/infrastructure/user.repository';
import { User } from '../../../user/domain/user.entity';
import { registrationEmailTemplate } from '../../../../core/services/mailler/email-templates/registration-email-template';
import { AuthService } from '../services/auth-service';

export class RegistrationUserCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly coreConfig: CoreConfig,
    private readonly authService: AuthService,
  ) {}

  async execute(
    command: RegistrationUserCommand,
  ): Promise<Notification<string | null>> {
    const { username, email, password } = command;

    // we are looking for a user by email
    const userByEmail: User = await this.userRepository.findByEmail(email);

    // case 1: the user exists and has already confirmed the email → error
    if (userByEmail && userByEmail.isEmailConfirmed()) {
      return Notification.badRequest([
        {
          message: 'User with this email is already registered',
          field: 'email',
        },
      ]);
    }

    // case 2: the user exists, but has not confirmed the email → update confirmation and send email
    if (userByEmail && !userByEmail.isEmailConfirmed()) {
      // await this.userRepository.deleteByEmail(email);
      userByEmail.generateNewConfirmationCode();

      await this.userRepository.update(userByEmail);

      // sending an email
      this.authService.sendEmail(
        userByEmail.getEmail(),
        registrationEmailTemplate,
        'Registration Confirmation',
        userByEmail.getConfirmationCode(),
      );

      return Notification.success();
    }

    // checking username uniqueness (only among verified ones)
    const userByUsername = await this.userRepository.findByUsername(username);
    if (userByUsername && userByUsername.isEmailConfirmed()) {
      return Notification.badRequest([
        {
          message: 'User with this username is already registered',
          field: 'username',
        },
      ]);
    }

    // creating a new user
    const passwordHash = await this.cryptoService.createHash(password, 10);
    const user = User.create(username, passwordHash, email);

    await this.userRepository.create(user);

    // sending an email
    this.authService.sendEmail(
      user.getEmail(),
      registrationEmailTemplate,
      'Registration Confirmation',
      user.getConfirmationCode(),
    );

    return Notification.success();
  }
}
