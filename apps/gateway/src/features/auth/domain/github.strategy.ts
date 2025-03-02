import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {UserRepository} from "../infrastructure/users.repository";
import {Oauth2Config} from "../../../core/config/Oauth2.config";
import {OauthTokenData} from "../api/dto/variable types/Oauth.type";
import {Notification} from "../../../core/notification/notification";
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private readonly userRepository: UserRepository,
        private config: Oauth2Config) {
        super({
            clientID: config.githubClient,
            clientSecret: config.githubClientSecret,
            callbackURL: 'https://photer.ltd/api/v1/auth/oauth/github/callback',
            passReqToCallback: true,
            scope: ['email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: OauthTokenData) {
        const user = await this.userRepository.findByEmail(profile.email);
        if (!user) return Notification.unauthorized('Not registered')
        return user
    }
}