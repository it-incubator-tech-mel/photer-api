import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '../exception-filters/exceptions/exception-types';
import { UserRepository } from '../../features/auth/infrastructure/users.repository';
import { User } from '../../features/auth/domain/user.entity';
import { OAuthAccountRepository } from '../../features/auth/infrastructure/oauth-account.repository';
import { ProviderType } from '@prisma/client';
import { OAuthAccount } from '../../features/auth/domain/oauth-account.entity';

////////////////////////////////
// !!! logic must be corrected
////////////////////////////////


interface VerifyCallback {
  (error: any, user?: any, info?: any): void;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService<any, true>,
    private readonly userRepository: UserRepository,
    private readonly oauthAccountRepository: OAuthAccountRepository
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

    // if there is no email in profile throw exception
    if (!emails || !emails.length) {
      return done(new UnauthorizedException(), null);
    }

    const email: string = emails[0].value;
    const foundUser: User = await this.userRepository.findByEmail(email);

    let user: User;

    if (!foundUser) {
      // if user not found
      const usernameFromProvider: string = username || displayName || email.split('@')[0];

      // check user exists with such email
      let existingUserByUsername: User = await this.userRepository.findByUsername(usernameFromProvider);

      // generate unique username
      let uniqueUsername: string = usernameFromProvider;
      if (existingUserByUsername) {
        uniqueUsername = `${usernameFromProvider}-${Math.floor(Math.random() * 1000)}`;
      }

      // create new user and confirm email
      user = User.create(uniqueUsername, null, email);
      user.confirmEmail();

      // ??? send registration email
      // await this.mailService.sendRegistrationEmail(email);

      // save user in db
      await this.userRepository.create(user);

      // check OAuthProvider exists
      let oauthAccount: OAuthAccount = await this.oauthAccountRepository.findByProviderAndProviderId(ProviderType.GOOGLE, id);

      if (!oauthAccount) {
        // create user provider
        const oauthAccountData = {
          userId: user.getId(),
          provider: ProviderType.GOOGLE,
          providerId: id,
          email: email,
        };

        await this.oauthAccountRepository.create(oauthAccountData);
      }
    } else {
      // if user exists
      user = foundUser;

      // check OAuthProvider exists
      let oauthAccount: OAuthAccount = await this.oauthAccountRepository.findByProviderAndProviderId(ProviderType.GOOGLE, id);

      if (!oauthAccount) {
        // create user provider
        const oauthAccountData = {
          userId: user.getId(),
          provider: ProviderType.GOOGLE,
          providerId: id,
          email: email,
        };

        await this.oauthAccountRepository.create(oauthAccountData);
      }
    }

    // return user
    return done(null, user);
  }
}
