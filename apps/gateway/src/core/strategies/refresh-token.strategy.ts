import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../features/auth/application/services/auth-service';
import { ConfigService } from '@nestjs/config';
import { RequestWithDeviceAndCookies } from '../../../base/types/request-with-device-and-cookie';
import { UnauthorizedException } from '../exception-filters/exceptions/exception-types';
import { unixToISOString } from '../../../base/utils/convert-unix-to-iso';
import {
  Notification,
  ResultStatus,
} from '../../../base/notification/notification';

/**
 * 1) extract token from cookie -> validate
 * 2) if not token provided -> pass validate method -> error in decorators or ignoreExpiration (not provided)
 */

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService<any, true>,
  ) {
    super({
      jwtFromRequest: (req: RequestWithDeviceAndCookies) => {
        return req.cookies?.refreshToken || null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: RequestWithDeviceAndCookies, payload: any) {
    const { userId, deviceId, iat } = payload;

    const validateUserByIdResult: Notification =
      await this.authService.validateUserById(userId);

    if (validateUserByIdResult.status === ResultStatus.NotFound) {
      throw new UnauthorizedException();
    }

    req.device = {
      userId: userId,
      deviceId: deviceId,
      iat: unixToISOString(iat),
    };

    return {};
  }
}
