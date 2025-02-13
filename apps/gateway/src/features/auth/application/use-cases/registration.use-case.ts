import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { Result } from '../../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { registrationEmailTemplate } from '../../../../core/services/mailler/email-templates/registration-email-template';
import { UsersRepository } from '../../infrastructure/users.repository';
import { MailerService } from '../../../../core/services/mailler/mailer.service';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
// import { User } from '../../../../users/domain/user.entity';

export class RegistrationUserCommand {
  constructor(
    public readonly login: string,
    public readonly password: string,
    public readonly email: string,
  ) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationUserCommand>
{
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly usersRepository: UsersRepository,
    private readonly mailerService: MailerService,
  ) {}

  async execute(
    command: RegistrationUserCommand,
  ): Promise<Result<string | null>> {
    const { login, password, email } = command;

    const [userByLogin, userByEmail] = await Promise.all([
      this.usersRepository.findByLogin(login),
      this.usersRepository.findByEmail(email),
    ]);

    if (userByLogin) {
      return Result.badRequest([
        {
          message: 'User with such credentials already exists',
          field: 'login',
        },
      ]);
    }

    if (userByEmail) {
      return Result.badRequest([
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

    const confirmationCode: string = randomUUID();

    const createdUser: User = await this.usersRepository.create(
      login,
      passwordHash,
      email,
      {
        confirmationCode: confirmationCode,
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 30,
        }),
        isConfirmed: false,
      },
      {
        recoveryCode: randomUUID(),
        expirationDate: new Date(),
      },
    );

    this.mailerService.sendEmail(
      createdUser.email,
      registrationEmailTemplate(confirmationCode),
      'Registration Confirmation',
    );

    return Result.success();
  }
}
