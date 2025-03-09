import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '../exception-filters/exceptions/exception-types';
import { AuthService } from '../../features/auth/application/services/auth-service';
import { Notification, ResultStatus } from '../notification/notification';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<any, true>,
    private readonly authService: AuthService
  ) {

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const { userId } = payload;

    const result: Notification = await this.authService.validateUserById(userId);

    if (result.status === ResultStatus.NotFound) {
      throw new UnauthorizedException();
    }

    return { id: payload.userId };
  }
}
