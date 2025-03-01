import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from "../../../devices/infrastructure/device.repository";
import { Notification } from '../../../../core/notification/notification';
import { randomUUID } from 'node:crypto';
import { Device } from '../../../devices/domain/device.entity';
import { AccessTokenPayload, JwtTokenService, RefreshTokenPayload } from '../../../../core/services/jwt/jwt-token.service';


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
    private readonly jwtService: JwtTokenService,
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
}
