import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy} from "passport-google-oauth20";
import {OauthTokenData} from "../api/dto/variable types/Oauth.type";
import {UserRepository} from "../infrastructure/users.repository";
import {Notification} from "../../../core/notification/notification";
import {Oauth2Config} from "../../../core/config/oauth2.config";

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

    async validate(accessToken: string, refreshToken: string, profile: OauthTokenData) {
        const user = await this.userRepository.findByEmail(profile.email);
        console.log(user,'user')
        if (!user) return Notification.unauthorized('Not registered')
        console.log(user,'123')
        return user
    }
}
