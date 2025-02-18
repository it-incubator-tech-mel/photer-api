import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../infrastructure/users.repository';
import { MailerService } from '../../../../core/services/mailler/mailer.service';
import { registrationEmailTemplate } from '../../../../core/services/mailler/email-templates/registration-email-template';
import { CoreConfig } from '../../../../core/config/core.config';
import { Notification, ResultStatus } from '../../../../core/notification/notification';
import { randomUUID } from 'crypto';
import { User } from '../../domain/user.entity';
import { add } from 'date-fns';

export class RegistrationEmailResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly coreConfig: CoreConfig,
  ) {}

  async execute(command: RegistrationEmailResendingCommand): Promise<any> {
    const { email } = command;
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return Notification.badRequest([
        { message: `User with email ${email} does not exist`, field: 'email' },
      ]);
    }

    try {
      this.resendConfirmation(user);
      await this.userRepository.save(user);
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


// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { randomUUID } from 'node:crypto';
// import { add } from 'date-fns';
// import { UserRepository } from '../../infrastructure/users.repository';
// import { MailerService } from '../../../../core/services/mailler/mailer.service';
// import {
//   registrationEmailTemplate
// } from '../../../../core/services/mailler/email-templates/registration-email-template';
// import { CoreConfig } from '../../../../core/config/core.config';
// import { Notification, ResultStatus } from '../../../../core/notification/notification';
//
// export class RegistrationEmailResendingCommand {
//   constructor(public readonly email: string) {}
// }
//
// @CommandHandler(RegistrationEmailResendingCommand)
// export class RegistrationEmailResendingUseCase implements ICommandHandler<RegistrationEmailResendingCommand> {
//   constructor(
//     private readonly userRepository: UserRepository,
//     private readonly mailerService: MailerService,
//     private coreConfig: CoreConfig,
//   ) {}
//
//   async execute(command: RegistrationEmailResendingCommand): Promise<any> {
//     const { email } = command;
//
//     const existingUser = await this.userRepository.findByEmail(email);
//
//     if (!existingUser) {
//       // return Result.badRequest('Invalid email provided');
//       return Notification.badRequest([
//         {
//           message: `User with email ${email} does not exist`,
//           field: 'email',
//         },
//       ]);
//     }
//
//     // hw-9 error in test -> comment this code
//     if (existingUser.emailConfirmation.isConfirmed) {
//       return Notification.badRequest([
//         {
//           message: 'Email already confirmed',
//           field: 'email',
//         },
//       ]);
//     }
//
//     const confirmationCode: string = randomUUID();
//     const expirationDate: Date = add(new Date(), {
//       hours: 1,
//       minutes: 30,
//     });
//
//     const userId: number = existingUser.id;
//
//     await this.userRepository.updateEmailConfirmationData(
//       confirmationCode,
//       expirationDate,
//       userId,
//     );
//
//     this.mailerService.sendEmail(
//       email,
//       registrationEmailTemplate(existingUser.getConfirmationCode(), this.coreConfig.baseUrl),
//       'Registration Confirmation',
//     );
//
//     return {
//       status: ResultStatus.Success,
//       data: null,
//     };
//   }
// }
