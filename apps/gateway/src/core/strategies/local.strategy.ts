import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Notification } from '../notification/notification';
import { UnauthorizedException } from '../exception-filters/exceptions/exception-types';
import { AuthService } from '../../features/auth/application/services/auth-service';

// check login data (extracts data from body)
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const result: Notification<number> =
      await this.authService.validateUser(
        email,
        password,
      );

    const userId: number = result.data;

    if (!userId) {
      throw new UnauthorizedException();
    }

    return { id: userId };
  }
}
