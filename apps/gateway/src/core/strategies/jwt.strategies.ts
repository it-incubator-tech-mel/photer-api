import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {AuthService} from "../../features/auth/application/services/auth-service";
import {JwtConfig} from "../config/jwt.config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtConfig: JwtConfig,
        ) {
        super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: jwtConfig.jwtSecret }); // Убедитесь, что секрет правильный
    }

    async validate(payload: any) {
        const user = await this.authService.validateUserByIdAndReturnBodyUser(payload.userId); // Implement this method as per your logic
        if (!user) {
            throw new UnauthorizedException();
        }
        return user; // Если пользователь валиден, возвращается дальше
    }
}