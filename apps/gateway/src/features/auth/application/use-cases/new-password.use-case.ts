import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import { UserRepository } from '../../infrastructure/users.repository';
import { Notification } from '../../../../core/notification/notification';
import { NewPasswordDto } from '../../api/dto/new-password.dto';
import { User } from '../../domain/user.entity';


export class NewPasswordCommand {
  constructor(
    public readonly newPasswordDto: NewPasswordDto,
  ) {
  }
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordCase
  implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly userRepository: UserRepository,
  ) {
  }

  async execute(
    command: NewPasswordCommand,
  ) {
    const { newPassword, recoveryCode } = command.newPasswordDto;

    const user: User | null = await this.userRepository.findUserByRecoveryCode(recoveryCode);

    if (!user) {
      return Notification.badRequest([{ message: 'Incorrect recovery code', field: 'recoveryCode' }]);
    }

    const salt: string = await this.cryptoService.genSalt();
    const newPasswordHash: string = await this.cryptoService.createHash(newPassword, salt);

    // const generateSalt = await bcrypt.genSalt(10);
    // const generateNewPassword = await this.cryptoService.createHash(newPassword, generateSalt);

    try {
      user.updatePassword(newPasswordHash);
      await this.userRepository.updatePasswordRecovery(user);
    } catch (err) {
      return Notification.badRequest([{ message: err.message, field: 'recoveryCode' }]);
    }

    // const findUserByRecoveryCodeAndReplacementPas = await this.userRepository.findByRecoveryCodeAndUpdateDate(generateNewPassword, recoveryCode, new Date());
    // if (!findUserByRecoveryCodeAndReplacementPas) {
    //   return Notification.badRequest([
    //     {
    //       message: 'Recovery code time has expired or incorrect code',
    //       field: 'recoveryCode',
    //     },
    //   ]);
    // }
  }
}