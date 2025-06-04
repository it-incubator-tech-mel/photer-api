import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '../../../../core/services/mailler/mailer.service';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import { Notification } from '../../../../../base/notification/notification';
import { CoreConfig } from '../../../../core/config/core.config';
import { UserRepository } from '../../../user/infrastructure/user.repository';
import { User } from '../../../user/domain/user.entity';

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
  ) {}

  async execute(
    command: RegistrationUserCommand,
  ): Promise<Notification<string | null>> {
    const { username, email, password } = command;

    const [userByLogin, userByEmail] = await Promise.all([
      this.userRepository.findByUsername(username),
      this.userRepository.findByEmail(email),
    ]);

    if (userByLogin) {
      return Notification.badRequest([
        {
          message: 'User with such credentials already exists',
          field: 'login',
        },
      ]);
    }

    if (userByEmail) {
      return Notification.badRequest([
        {
          message: 'User with such credentials already exists',
          field: 'email',
        },
      ]);
    }

    const saltRounds: number = 10;
    const passwordHash: string = await this.cryptoService.createHash(
      password,
      saltRounds,
    );

    const user: User = User.create(username, passwordHash, email);
    user.confirmEmail();
    console.log('create user', user);
    await this.userRepository.create(user);

    // temp comment user confirmed
    // await this.mailerService.sendEmail(
    //   user.getEmail(),
    //   registrationEmailTemplate(
    //     user.getConfirmationCode(),
    //     this.coreConfig.baseUrl,
    //   ),
    //   'Registration Confirmation',
    // );
    //

    return Notification.success();
  }
}
