import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../infrastructure/users.repository';
import { CryptoService } from '../../../../core/services/crypto/crypto.service';
import {LoginDto} from "../../api/dto/login.dto";
import bcrypt from "bcrypt";
import {DeviceClass} from "../../api/dto/Device-type";
import {DeviceRepository} from "../../infrastructure/device.repository";
import {JwtService} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {userAgentType} from "../../api/dto/variable types/variable-types-for-authorization";
import {Result} from "../../../../../base/object-result";
import {User} from "../../domain/user.entity";


export class LoginUserCommand {
    constructor(
        public readonly loginDto: LoginDto,
        public readonly userAgent: userAgentType,
    ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUseCase
    implements ICommandHandler<LoginUserCommand>
{
    constructor(
        private readonly cryptoService: CryptoService,
        private readonly userRepository: UserRepository,
        private jwtService: JwtService,
        private readonly deviceRepository: DeviceRepository,
        private configService: ConfigService<any, true>
    ) {}

    async execute(
        command: LoginUserCommand,
    ): Promise< {} | null> {
        const { password, email } = command.loginDto;

        const user: User = await this.checkCredentials(
            email,
            password,
        );
        if (!user) {
            return {
                accessToken: null,
                refreshToken: null
            }
        }
        if (!user) throw Result.unauthorized(
            'unauthorized',
            [{
                message: 'User with such credentials already exists',
                field: 'login',
            }],
        )
        const createRefreshTokenMeta = new DeviceClass(
            command.userAgent.IP || '123',
            command.userAgent.deviceName || 'internet',
            new Date().toISOString(),
            user.getId(),
        );

        const addDeviceToDB = await this.deviceRepository.createDeviceAndSaveToDB(
            createRefreshTokenMeta,
            user.getId(),
        );
        const bodyToAccessToken = {
            email: user.getEmail(),
            userId: user.getId(),
        };
        const bodyToRefreshToken = {
            email: user.getEmail(),
            userId: user.getId(),
            deviceId: addDeviceToDB.id,
        };
        const accessToken: string = await this.jwtService.signAsync(
            bodyToAccessToken,
            { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '1000s' },
        );
        const refreshToken: string = await this.jwtService.signAsync(
            bodyToRefreshToken,
            { secret: this.configService.get<string>('JWT_REFRESH_SECRET'), expiresIn: '2000s' },
        );
        await this.deviceRepository.updateTimeDeviceInDB(addDeviceToDB, refreshToken);
        return { accessToken, refreshToken };
    }
    protected async _generateHash(password: string, salt: string) {
        return bcrypt.hash(password, salt);
    }
    protected async checkCredentials(
        email: string,
        password: string,
    ): Promise<User | null> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) return null

        const passwordHash = await this._generateHash(password, user.getPassword());
        if (user.getPassword() !== passwordHash) return null
        return user;
    }
}
