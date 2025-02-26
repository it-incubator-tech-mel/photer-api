import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CryptoService} from "../../../../core/services/crypto/crypto.service";
import {UserRepository} from "../../infrastructure/users.repository";
import {Notification} from "../../../../core/notification/notification";
import bcrypt from "bcrypt";
import {NewPasswordDto} from "../../api/dto/new-password.dto";


export class NewPasswordCommand {
    constructor(
        public readonly newPasswordDto: NewPasswordDto
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
        const {newPassword, recoveryCode} = command.newPasswordDto
        const generateSalt = await bcrypt.genSalt(10)
        const generateNewPassword = await this.cryptoService.createHash(newPassword, generateSalt)
        const findUserByRecoveryCodeAndReplacementPas = await this.userRepository.findByRecoveryCodeAndUpdateDate(generateNewPassword, recoveryCode, new Date())
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