import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '../exception-filters/exceptions/exception-types';
import { UserRepository } from '../../features/auth/infrastructure/users.repository';
import { User } from '../../features/auth/domain/user.entity';
import { OAuthAccountRepository } from '../../features/auth/infrastructure/oauth-account.repository';
import { AuthService } from '../../features/auth/application/services/auth-service';
import { OAuthAccount, ProviderType } from '@prisma/client';

/**
 * 1) find user by email --> + -->  2) merge oAuthAccount (may exist or no, register by other method)
 *                           - -->  3) find by provideId  + --> 4) change email in oAuthAccount
 *                                                        - --> 5) create user and oAuthAccount
 */

interface VerifyCallback {
  (error: any, user?: any, info?: any): void;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService<any, true>,
    private readonly userRepository: UserRepository,
    private readonly oauthAccountRepository: OAuthAccountRepository,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/api/v1/auth/oauth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    // console.log("GoogleStrategy profile", profile);
    const { id, displayName, username, name, emails } = profile;

    if (!emails || !emails.length) {
      return done(new UnauthorizedException(), null);
    }

    const email: string = emails[0].value;

    const user: User = await this.authService.handleOAuthLogin(ProviderType.GOOGLE, id, email, username, displayName);

    // console.log("user", user);
    return user;
  }
}