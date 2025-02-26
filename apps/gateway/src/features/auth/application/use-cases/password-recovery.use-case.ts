import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UserRepository} from "../../infrastructure/users.repository";
import {MailerService} from "../../../../core/services/mailler/mailer.service";
import {CoreConfig} from "../../../../core/config/core.config";
import {RegistrationEmailResendingCommand} from "./registration-email-resending.use-case";
import {PasswordRecoveryDto} from "../../api/dto/password-recovery.dto";
import {Result} from "../../../../../base/object-result";
import {randomUUID} from "crypto";
import {PasswordRecovery} from "../../domain/password-recovery";


export class PasswordRecoveryUseCommand {
    constructor(public readonly email: string) {}
}
@CommandHandler(PasswordRecoveryUseCommand)
export class PasswordRecoveryUseCase
    implements ICommandHandler<PasswordRecoveryUseCommand> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly mailerService: MailerService,
        private readonly coreConfig: CoreConfig,
    ) {}
    async execute(command: PasswordRecoveryUseCommand): Promise<any> {
        const { email } = command;
        const existingUser = await this.userRepository.findByEmail(email);
        if (!existingUser) return Result.badRequest()
        const generateRecoveryCode = randomUUID()
        const createPasswordRecoveryCodeBody = PasswordRecovery.createForUser(existingUser.getId(), generateRecoveryCode)
        await this.userRepository.updateRecoveryCodeByEmailOrSave(createPasswordRecoveryCodeBody);
        await this.mailerService.sendEmail(email, generateRecoveryCode, 'password recovery')
    }

}
