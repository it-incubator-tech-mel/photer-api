import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { ProviderType } from '@prisma/client';
import { UnauthorizedException } from '../exception-filters/exceptions/exception-types';
import { AuthService } from '../../features/auth/application/services/auth-service';
import { User } from '../../features/auth/domain/user.entity';

/**
 * 1) find user by email -->
 * 2) find oAuthAccount by provideId and providerType --> 1+ && 2+ --> 3) merge oAuthAccount (update email)
 *                                                        1+ && 2- --> 4) create oAuthAccount; send email
 *                                                        1- --> 5) create user; create oAuthAccount; send email
 */

interface VerifyCallback {
  (error: any, user?: any, info?: any): void;
}

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService<any, true>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      // callbackURL: 'https://photer.ltd/api/v1/auth/oauth/github/callback',
      callbackURL: 'http://localhost:3000/api/v1/auth/oauth/github/login',
      scope: ['user:email'],
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
      ProviderType.GITHUB,
      id,
      email,
      username,
      displayName,
    );

    return done(null, user);
  }
}
