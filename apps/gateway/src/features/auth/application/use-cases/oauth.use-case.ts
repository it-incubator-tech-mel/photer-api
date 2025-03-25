import { Notification } from '../../../../../base/notification/notification';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  AccessTokenPayload,
  JwtTokenService,
  RefreshTokenPayload,
} from '../../../../core/services/jwt/jwt-token.service';
import { DeviceRepository } from '../../../devices/infrastructure/device.repository';
import { randomUUID } from 'crypto';
import { User } from '../../domain/user.entity';
import { Device } from '../../../devices/domain/device.entity';

export class OAuthCommand {
  constructor(
    public readonly user: User,
    public readonly ip: string,
    public readonly deviceName: string,
  ) {}
}

@CommandHandler(OAuthCommand)
export class OAuthUseCase implements ICommandHandler<OAuthCommand> {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async execute(command: OAuthCommand): Promise<any> {
    const { user, ip, deviceName } = command;
    const JwtAccessTokenPayload: AccessTokenPayload = { userId: user.getId() };
    const deviceId: string = randomUUID();
    const JwtRefreshTokenPayload: RefreshTokenPayload = {
      userId: user.getId(),
      deviceId,
    };

    // generate tokens
    const accessToken: string = await this.jwtTokenService.generateAccessToken(
      JwtAccessTokenPayload,
    );
    const refreshToken: string =
      await this.jwtTokenService.generateRefreshToken(JwtRefreshTokenPayload);

    // decode refresh token
    const decodedRefreshToken: RefreshTokenPayload =
      await this.jwtTokenService.decode<RefreshTokenPayload>(refreshToken);
    if (!decodedRefreshToken)
      return Notification.unauthorized('Invalid refresh token');

    // add refresh token to db

    // create device
    const { iat, exp } = decodedRefreshToken;
    const device: Device = Device.create(
      deviceId,
      user.getId(),
      deviceName,
      ip,
      iat,
      exp,
    );

    await this.deviceRepository.create(device);

    return Notification.success({
      accessToken,
      refreshToken,
    });
  }
}
