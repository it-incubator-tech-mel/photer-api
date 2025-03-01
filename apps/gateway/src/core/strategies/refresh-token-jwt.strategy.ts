import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../features/auth/application/services/auth-service';
import { ConfigService } from '@nestjs/config';
import { RequestWithDeviceAndCookies } from '../../../base/types/request-with-device-and-cookie';
import { UnauthorizedException } from '../exception-filters/exceptions/exception-types';
import { unixToISOString } from '../utils/convert-unix-to-iso';
import { Notification, ResultStatus } from '../notification/notification';

// logic
// 1) extract token from cookie -> validate
// 2) if not token provided -> pass validate method -> error in decorators (not provided)
@Injectable()
export class RefreshTokenJwtStrategy extends PassportStrategy(
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
      secretOrKey: configService.get('apiSettings', {
        infer: true,
      }).JWT_SECRET,
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
      deviceId,
      iat: unixToISOString(iat),
    };

    return {};
  }
}
