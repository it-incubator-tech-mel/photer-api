import {LoginDto} from "../../api/dto/login.dto";
import {userAgentType} from "../../api/dto/variable types/variable-types-for-authorization";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CryptoService} from "../../../../core/services/crypto/crypto.service";
import {UserRepository} from "../../infrastructure/users.repository";
import {JwtService} from "@nestjs/jwt";
import {DeviceRepository} from "../../infrastructure/device.repository";
import {ConfigService} from "@nestjs/config";
import {Notification} from "../../../../core/notification/notification";
import {RegistrationUserCommand} from "./registration.use-case";
import bcrypt from "bcrypt";
import {Result} from "../../../../../base/object-result";

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