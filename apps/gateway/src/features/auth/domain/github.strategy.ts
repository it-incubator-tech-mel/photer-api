import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {UserRepository} from "../infrastructure/users.repository";
import {Oauth2Config} from "../../../core/config/Oauth2.config";
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
            // callbackURL: 'http://localhost:3000/api/v1/auth/oauth/github/callback',
            // passReqToCallback: true,
            scope: ['user:email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        const user = { email: '' }
        if (profile.emails?.length) {
            user.email = profile.emails[0].value;
        }
        console.log(profile)
        // const token = this.jwtService.sign(user) // можем создать функцию создания нашего токена или обращаться к уже существующим функциям
        // done(null, { user, token });
        return user
        // let email = profile.email;
        // if (!email) {
        //     const emails = await fetch('https://api.github.com/user/emails', {
        //         headers: { Authorization: `token ${accessToken}` },
        //     }).then(res => res.json());
        //
        //     const primaryEmail = emails.find(e => e.primary && e.verified);
        //     email = primaryEmail ? primaryEmail.email : null;
        // }
        // if (!email) return Notification.unauthorized('Email not found');
        //
        // const user = await this.userRepository.findByEmail(email);
        // if (!user) return Notification.unauthorized('Not registered');
        //
        // return user;
        // const user = await this.userRepository.findByEmail(profile.email);
        // if (!user) return Notification.unauthorized('Not registered')
        // return user
    }
}