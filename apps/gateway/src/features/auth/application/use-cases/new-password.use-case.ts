import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CryptoService} from "../../../../core/services/crypto/crypto.service";
import {UserRepository} from "../../infrastructure/users.repository";
import {Notification} from "../../../../core/notification/notification";
import bcrypt from "bcrypt";


export class NewPasswordCommand {
    constructor(
        public readonly newPassword: string,
        public readonly recoveryCode: string,
    ) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordCase
    implements ICommandHandler<NewPasswordCommand> {
    constructor(
        private readonly cryptoService: CryptoService,
        private readonly userRepository: UserRepository,
    ) {}
    async execute (
        command: NewPasswordCommand,
    ) {
        const generateSalt = await bcrypt.genSalt(10)
        const newPassword = await this.cryptoService.createHash(command.newPassword, generateSalt)
        const findUserByRecoveryCodeAndReplacementPas = await this.userRepository.findByRecoveryCodeAndUpdateDate(newPassword, command.recoveryCode, new Date())
        if (!findUserByRecoveryCodeAndReplacementPas){
            return Notification.badRequest([
                {
                    message: 'Recovery code time has expired',
                    field: 'recoveryCode',
                },
            ]);
        }
    }
}