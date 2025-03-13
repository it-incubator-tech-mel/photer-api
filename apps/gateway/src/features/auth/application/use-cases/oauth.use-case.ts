import { Notification } from '../../../../core/notification/notification';
import {
  AccessTokenPayload,
  JwtTokenService,
  RefreshTokenPayload,
} from '../../../../core/services/jwt/jwt-token.service';
import { randomUUID } from 'node:crypto';
// import { User } from '@prisma/client';
import { LoginCommand } from './login.use-case';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {User} from "../../domain/user.entity";
import {DeviceRepository} from "../../../devices/infrastructure/device.repository";
import {Device} from "../../../devices/domain/device.entity";

export class OAuthCommand {
  constructor(
      public readonly user: User,
      public readonly ip: string,
      public readonly deviceName: string) {
    // Object.assign(this, user);
  }
}

@CommandHandler(OAuthCommand)
export class OAuthUseCase implements ICommandHandler<OAuthCommand> {
  constructor(
      private readonly jwtTokenService: JwtTokenService,
      private readonly deviceRepository: DeviceRepository,
  ) {
  }

  async execute(command: OAuthCommand): Promise< {} | null> {

    const {user, ip, deviceName} = command;
    const JwtAccessTokenPayload: AccessTokenPayload = { userId: user.getId() };
    const deviceId: string = randomUUID();
    const JwtRefreshTokenPayload: RefreshTokenPayload = { userId: user.getId(), deviceId };

    // generate tokens
    const accessToken: string = await this.jwtTokenService.generateAccessToken(JwtAccessTokenPayload);
    const refreshToken: string = await this.jwtTokenService.generateRefreshToken(JwtRefreshTokenPayload);

    // decode refresh token
    const decodedRefreshToken: RefreshTokenPayload = await this.jwtTokenService.decode<RefreshTokenPayload>(refreshToken);
    if (!decodedRefreshToken) return Notification.unauthorized('Invalid refresh token');

    // add refresh token to db

    // create device
    const { iat, exp } = decodedRefreshToken;
    const device: Device = Device.create(
        deviceId,
        user.getId(),
        deviceName,
        ip,
        iat,
        exp
    );

    await this.deviceRepository.create(device);

    return Notification.success({
      accessToken,
      refreshToken,
    });

    // ... logic

    // create payload for tokens
    // const JwtAccessTokenPayload: AccessTokenPayload = { userId: command.userId };
    // const deviceId: string = randomUUID();
    // const JwtRefreshTokenPayload: RefreshTokenPayload = { userId: command.userId, deviceId };

    // generate tokens
    // const accessToken: string = await this.jwtTokenService.generateAccessToken(JwtAccessTokenPayload);
    // const refreshToken: string = await this.jwtTokenService.generateRefreshToken(JwtRefreshTokenPayload);


    // return Notification.success({
    //   accessToken,
    //   refreshToken,
    // });
  }
}
