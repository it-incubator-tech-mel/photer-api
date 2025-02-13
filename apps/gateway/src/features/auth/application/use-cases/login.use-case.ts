import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
// import { Result } from '../../../../../base/types/object-result';
import { randomUUID } from 'node:crypto';
import { add } from 'date-fns';
import { registrationEmailTemplate } from '../../../../core/services/mailler/email-templates/registration-email-template';
import { UsersRepository } from '../../infrastructure/users.repository';
import { MailerService } from '../../../../core/services/mailler/mailer.service';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import {Result} from "../../../../../base/object-result";
import {LoginDto} from "../../api/dto/login.dto";
import {UserType} from "../../api/dto/User-type";
import bcrypt from "bcrypt";
import {DeviceClass} from "../../api/dto/Device-type";
import {DeviceRepository} from "../../infrastructure/device.repository";
import {JwtService} from "@nestjs/jwt";
import {setting} from "../../../../../settings";
// import { User } from '../../../../users/domain/user.entity';

export class LoginUserCommand {
    constructor(
        public readonly loginDto: LoginDto,
        public readonly userAgent: {
            IP: string,
            deviceName: string, },
    ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUseCase
    implements ICommandHandler<LoginUserCommand>
{
    constructor(
        private readonly cryptoService: CryptoService,
        private readonly usersRepository: UsersRepository,
        private jwtService: JwtService,
        private readonly deviceRepository: DeviceRepository,
    ) {}

    async execute(
        command: LoginUserCommand,
    ): Promise< {} | null> {
        const { password, email } = command.loginDto;

        const user: UserType = await this.checkCredentials(
            email,
            password,
        );

        const createRefreshTokenMeta = new DeviceClass(
            command.userAgent.IP || '123',
            command.userAgent.deviceName || 'internet',
            new Date().toISOString(),
            user.id,
        );

        const addDeviceToDB = await this.deviceRepository.createDeviceAndSaveToDB(
            createRefreshTokenMeta,
            user.id,
        );
        const bodyToAccessToken = {
            email: user.email,
            userId: user.id.toString(),
        };
        const bodyToRefreshToken = {
            email: user.email,
            userId: user.id.toString(),
            deviceId: addDeviceToDB.deviceId,
        };
        const accessToken: string = await this.jwtService.signAsync(
            bodyToAccessToken,
            { secret: setting.JWT_SECRET, expiresIn: '1000s' },
        );
        const refreshToken: string = await this.jwtService.signAsync(
            bodyToRefreshToken,
            { secret: setting.JWT_REFRESH_SECRET, expiresIn: '2000s' },
        );
        // await this.refreshTokenRepo.AddRefreshTokenInData(refreshToken);
        // await this.refreshTokenRepo.AddRefreshTokenInData(refreshToken);
        await this.deviceRepository.addDeviceInDB(addDeviceToDB, refreshToken);
        return { accessToken, refreshToken };
    }
    protected async _generateHash(password: string, salt: string) {
        return bcrypt.hash(password, salt);
    }
    protected async checkCredentials(
        email: string,
        password: string,
    ): Promise<UserType | null> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) return null;

        const passwordHash = await this._generateHash(password, user.password);
        if (user.password !== passwordHash) return null
        return user;
    }
}
