import { Notification } from '../../../../core/notification/notification';
import {
  AccessTokenPayload,
  JwtTokenService,
  RefreshTokenPayload,
} from '../../../../core/services/jwt/jwt-token.service';
import { randomUUID } from 'node:crypto';
import { User } from '@prisma/client';
import { LoginCommand } from './login.use-case';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class OAuthCommand {
  constructor(user: User) {
    Object.assign(this, user);
  }
}

@CommandHandler(OAuthCommand)
export class OAuthUseCase implements ICommandHandler<OAuthCommand> {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
  ) {
  }

  async execute(command: OAuthCommand): Promise< {} | null> {

    const user = { command };

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
