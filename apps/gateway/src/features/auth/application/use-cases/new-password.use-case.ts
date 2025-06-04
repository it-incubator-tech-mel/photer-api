import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import { Notification } from '../../../../../base/notification/notification';
import { NewPasswordDto } from '../../api/dto/input/new-password.dto';
import { User } from '../../../user/domain/user.entity';
import { UserRepository } from '../../../user/infrastructure/user.repository';

export class NewPasswordCommand {
  constructor(public readonly newPasswordDto: NewPasswordDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: NewPasswordCommand) {
    const { newPassword, recoveryCode } = command.newPasswordDto;

    const user: User | null =
      await this.userRepository.findUserByRecoveryCode(recoveryCode);

    if (!user)
      return Notification.badRequest([
        { message: 'Incorrect recovery code', field: 'recoveryCode' },
      ]);

    const salt: string = await this.cryptoService.genSalt();
    const newPasswordHash: string = await this.cryptoService.createHash(
      newPassword,
      salt,
    );

    try {
      user.updatePassword(newPasswordHash);
      await this.userRepository.updateOrCreatePasswordRecovery(user);

      return Notification.success();
    } catch (err) {
      return Notification.badRequest([
        { message: err.message, field: 'recoveryCode' },
      ]);
    }
  }
}
