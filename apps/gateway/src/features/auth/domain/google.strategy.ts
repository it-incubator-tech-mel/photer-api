import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy, VerifyCallback} from "passport-google-oauth20";
import {UserRepository} from "../infrastructure/users.repository";
import {Oauth2Config} from "../../../core/config/Oauth2.config";
import {Profile} from "passport";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly userRepository: UserRepository,
        private config: Oauth2Config) {
        super({
            clientID: config.googleClient,
            clientSecret: config.googleClientSecret,
            callbackURL: 'https://photer.ltd/api/v1/auth/oauth/google/callback',
            passReqToCallback: true,
            scope: ['profile', 'email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
        const user = { email: '' }
        if (profile.emails?.length) {
            user.email = profile.emails[0].value;
        }
        console.log({profile})
        return user
    }
}

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
