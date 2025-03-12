import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy, VerifyCallback} from "passport-google-oauth20";
import {UserRepository} from "../infrastructure/users.repository";
import {Oauth2Config} from "../../../core/config/Oauth2.config";
import {Profile} from "passport";
import {JwtService} from "@nestjs/jwt";
import {JwtServiceProvider} from "../../../core/services/jwt/jwt-service-provider.service";
import {randomUUID} from "node:crypto";
import {User} from "./user.entity";
import {CryptoService} from "../../../core/services/crypto/crypto.service";
import {UnauthorizedException} from "../../../core/exception-filters/exceptions/exception-types";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly jwtServiceBW: JwtServiceProvider,
        private readonly cryptoService: CryptoService,
        private config: Oauth2Config) {
        super({
            clientID: config.googleClient,
            clientSecret: config.googleClientSecret,
            // callbackURL: 'https://photer.ltd/api/v1/auth/oauth/google/callback',
            callbackURL: 'http://localhost:3000/api/v1/auth/oauth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
        if (profile.emails?.length) {
            const findUser = await this.userRepository.findByEmailNotMapper(profile.emails[0].value);
            if (!findUser){
                return this.createUser(findUser, profile)
            }else {
                await this.userRepository.updateServiceForRegistration(findUser.id, 'google')
                const deviceId: string = randomUUID();
                const [createAccessToken, createRefreshToken] = await Promise.all([
                    this.jwtServiceBW.generateAccessToken({userId: findUser.id}),
                    this.jwtServiceBW.generateRefreshToken({userId: findUser.id, deviceId: findUser.devices[0].id})
                ])
                return {createAccessToken, createRefreshToken}
            }

        }
        throw new UnauthorizedException()

    }

    async createUser(user: any, profile: Profile){
        const password = user.email + profile.displayName
        const saltRounds: number = 10;
        const passwordHash: string = await this.cryptoService.createHash(
            password,
            saltRounds,
        );
        user.email = profile.emails[0].value;
        const registrationUser: User = User.create(profile.displayName, passwordHash, user.email);
        await this.userRepository.create(registrationUser);
        return registrationUser
    }
}

