import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from "../../../devices/infrastructure/device.repository";
import { Notification } from '../../../../core/notification/notification';
import { randomUUID } from 'node:crypto';
import { Device } from '../../../devices/domain/device.entity';
import { AccessTokenPayload, JwtServiceProvider, RefreshTokenPayload } from '../../../../core/services/jwt/jwt-service-provider.service';

// export class LoginUserCommand {
//   constructor(
//     public readonly loginDto: LoginDto,
//     public readonly userAgent: userAgentType,
//   ) {}
// }

export class LoginCommand {
  constructor(
    public readonly userId: number,
    public readonly ip: string,
    public readonly deviceName: string,
    public readonly refreshToken: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase
  implements ICommandHandler<LoginCommand>
{
  constructor(
    private readonly jwtService: JwtServiceProvider,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise< {} | null> {

    // pass login if refreshToken not passed (not valid)
    if (command.refreshToken) {
      try {
        await this.jwtService.verify<RefreshTokenPayload>(command.refreshToken);

        return Notification.unauthorized(
          'Refresh token is still valid. Logout before logging in again',
        );
      } catch (err) {
        // Invalid refresh token, proceeding with login
      }
    }

    // create payload for tokens
    const JwtAccessTokenPayload: AccessTokenPayload = { userId: command.userId };
    const deviceId: string = randomUUID();
    const JwtRefreshTokenPayload: RefreshTokenPayload = { userId: command.userId, deviceId };

    // generate tokens
    const accessToken: string = await this.jwtService.generateAccessToken(JwtAccessTokenPayload);
    const refreshToken: string = await this.jwtService.generateRefreshToken(JwtRefreshTokenPayload);

    // decode refresh token
    const decodedRefreshToken: RefreshTokenPayload = await this.jwtService.decode<RefreshTokenPayload>(refreshToken);
    if (!decodedRefreshToken) {
      return Notification.unauthorized('Invalid refresh token');
    }

    // create device
    const { iat, exp } = decodedRefreshToken;
    const device: Device = Device.create(
      deviceId,
      command.userId,
      command.deviceName,
      command.ip,
      iat,
      exp
    );

    await this.deviceRepository.create(device);

    return Notification.success({
      accessToken,
      refreshToken,
    });
  }

    // const { password, email } = command.loginDto;

    // const user: UserType = await this.checkCredentials(
    //   email,
    //   password,
    // );
    // if (!user) {
    //   return {
    //     accessToken: null,
    //     refreshToken: null
    //   }
    // }
    //
    // if (!user) throw Notification.unauthorized(
    //     'unauthorized',
    //     [{
    //         message: 'User with such credentials already exists',
    //         field: 'login',
    //     }],
    // )

    // const createRefreshTokenMeta = new DeviceClass(
    //   command.userAgent.IP || '123',
    //   command.userAgent.deviceName || 'internet',
    //   new Date().toISOString(),
    //   user.id,
    // );

    //   const addDeviceToDB = await this.deviceRepository.createDeviceAndSaveToDB(
    //     createRefreshTokenMeta,
    //     user.id,
    //   );
    //
    //   const bodyToAccessToken = {
    //     email: user.email,
    //     userId: user.id.toString(),
    //   };
    //
    //   const bodyToRefreshToken = {
    //     email: user.email,
    //     userId: user.id.toString(),
    //     deviceId: addDeviceToDB.deviceId,
    //   };
    //   const accessToken: string = await this.jwtService.signAsync(
    //     bodyToAccessToken,
    //     { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '1000s' },
    //   );
    //   const refreshToken: string = await this.jwtService.signAsync(
    //     bodyToRefreshToken,
    //     { secret: this.configService.get<string>('JWT_REFRESH_SECRET'), expiresIn: '2000s' },
    //   );
    //   await this.deviceRepository.addDeviceInDB(addDeviceToDB, refreshToken);
    //   return { accessToken, refreshToken };
    // }
    // protected async _generateHash(password: string, salt: string) {
    //   return bcrypt.hash(password, salt);
    // }
    // protected async checkCredentials(
    //   email: string,
    //   password: string,
    // ): Promise<UserType | null> {
    //   const user: User | null = await this.userRepository.findByEmail(email);
    //
    //   if (!user) return null
    //
    //   const passwordHash = await this._generateHash(password, user.password);
    //   if (user.password !== passwordHash) return null
    //   return user;
    // }
}
