import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../../features/auth/application/services/auth-service';
import { JwtConfig } from '../config/jwt.config';
import {
  Notification,
  ResultStatus,
} from '../../../base/notification/notification';

// logic optional-jwt
// -- with correct token
// 1) token valid, not expired -> in validate method -> request passed in OptionalJwtAuthGuard.handleRequest() -> return req.user.userId=id
// -- token not valid or without token
// 1) request passed in OptionalJwtAuthGuard.handleRequest() -> req.user.userId = null

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'optional-jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtConfig: JwtConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // 401 Unauthorized
      secretOrKey: jwtConfig.jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const result: Notification = await this.authService.validateUserById(
      payload.userId,
    );

    if (result.status === ResultStatus.NotFound || !payload) {
      return { userId: null };
    }

    return { userId: payload.userId || null };
  }
}
