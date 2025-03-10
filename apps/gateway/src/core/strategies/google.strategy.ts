import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../features/auth/infrastructure/users.repository';
import { Oauth2Config } from '../config/oauth2.config';
import { Strategy } from 'passport-google-oauth20';
import { VerifyCallback } from 'passport-jwt';


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private config: Oauth2Config) {
    super({
      clientID: config.googleClient,
      clientSecret: config.googleClientSecret,
      // callbackURL: 'https://photer.ltd/api/v1/auth/oauth/google/callback',
      callbackURL: 'http://localhost:3000/api/v1/auth/oauth/google/callback',
      // passReqToCallback: true,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    const user = { email: '' };
    if (profile.emails?.length) {
      const findUser = await this.userRepository.findByEmail(profile.emails[0].value);
      console.log(findUser, 'findUser');
      console.log(profile.emails[0].value, 'profile.emails[0].value');
      if (!findUser) {
        user.email = profile.emails[0].value;
        console.log(user, 'user');
        return user;
      }
      console.log(findUser, 'findUser');
      return findUser;
    }
    // const user = { email: '' }
    // if (profile.emails?.length) {
    //     user.email = profile.emails[0].value;
    // }
    // // const token = this.jwtService.sign(user) // можем создать функцию создания нашего токена или обращаться к уже существующим функциям
    // // done(null, { user, token });
    // return user
  }
}

//https://photer.ltd/api/v1/auth/oauth/google/callback
// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//     constructor(
//         private readonly configService: ConfigService<ConfigurationType, true>,
//     ) {
//         const settingsOAuth: GoogleOAthSettingsType = configService.get(
//             'googleOAthSettings',
//             {
//                 infer: true,
//             },
//         );
//         super({
//             clientID: settingsOAuth.GOOGLE_OAUTH_CLIENT_ID,
//             clientSecret: settingsOAuth.GOOGLE_OAUTH_CLIENT_SECRET,
//             callbackURL: settingsOAuth.GOOGLE_OAUTH_REDIRECT_URL,
//             scope: ['email', 'profile'],
//         });
//     }
//
//     async validate(
//         accessToken: string,
//         refreshToken: string,
//         profile: Profile,
//         done: VerifyCallback,
//     ): Promise<GoogleUserInfoType> {
//         const user: GoogleUserInfoType = { email: '' };
//         if (profile.emails?.length) {
//             user.email = profile.emails[0].value;
//         }
//         return user;
//     }
// }