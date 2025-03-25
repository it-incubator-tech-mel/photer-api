import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '../exception-filters/exceptions/exception-types';
import { User } from '../../features/auth/domain/user.entity';
import { AuthService } from '../../features/auth/application/services/auth-service';
import { ProviderType } from '@prisma/client';

interface VerifyCallback {
  (error: any, user?: any, info?: any): void;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService<any, true>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      // callbackURL: 'https://photer.ltd/api/v1/auth/oauth/google/callback',
      callbackURL: 'http://localhost:3000/api/v1/auth/oauth/google/login',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, username, name, emails } = profile;

    if (!emails || !emails.length) {
      return done(new UnauthorizedException(), null);
    }

    const email: string = emails[0].value;

    const user: User = await this.authService.handleOAuthLogin(
      ProviderType.GOOGLE,
      id,
      email,
      username,
      displayName,
    );

    return done(null, user);
  }
}
