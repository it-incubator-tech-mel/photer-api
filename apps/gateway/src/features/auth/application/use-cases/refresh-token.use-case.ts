import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  AccessTokenPayload,
  JwtTokenService,
  RefreshTokenPayload,
} from '../../../../core/services/jwt/jwt-token.service';
import { Notification } from '../../../../../base/notification/notification';
import { unixToISOString } from '../../../../../base/utils/convert-unix-to-iso';
import { DeviceRepository } from '../../../device/infrastructure/device.repository';
import { Device } from '../../../device/domain/device.entity';

/**
 * on refreshToken update in device updates iat, exp the same
 * exp will be > new Date() soon
 * delete this
 */

export class RefreshTokenCommand {
  constructor(
    public userId: number,
    public deviceId: string,
    public iat: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly deviceRepository: DeviceRepository,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<
    Notification<null | { accessToken: string; refreshToken: string }>
  > {
    const { deviceId, userId, iat: issuedAt } = command;

    const device: Device | null =
      await this.deviceRepository.findOneByDeviceIdAndIat(deviceId, issuedAt);

    if (!device) return Notification.unauthorized('Invalid refresh token');

    // create payload for tokens
    const JwtAccessTokenPayload: AccessTokenPayload = { userId };
    const JwtRefreshTokenPayload: RefreshTokenPayload = {
      userId: command.userId,
      deviceId,
    };

    // generate tokens
    const accessToken: string = await this.jwtTokenService.generateAccessToken(
      JwtAccessTokenPayload,
    );
    const refreshToken: string =
      await this.jwtTokenService.generateRefreshToken(JwtRefreshTokenPayload);

    const decodedRefreshToken: RefreshTokenPayload =
      await this.jwtTokenService.decode<RefreshTokenPayload>(refreshToken);
    if (!decodedRefreshToken)
      return Notification.unauthorized('Invalid refresh token');

    if (decodedRefreshToken) {
      const { iat } = decodedRefreshToken;

      const issuedAt: string = unixToISOString(iat);

      // TODO: update only iat? or exp also
      await this.deviceRepository.updateIat(deviceId, issuedAt);

      return Notification.success({
        accessToken,
        refreshToken,
      });
    }
    return Notification.unauthorized();
  }
}
