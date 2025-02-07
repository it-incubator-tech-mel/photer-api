import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class BearerGuard implements CanActivate {
    constructor(
        protected jwtService: JwtService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization;
        if (!token) throw new UnauthorizedException();

        try {
            const decodedToken = this.jwtService.verify(
                token.replace('Bearer ', ''),
                { secret: '' }, //TODO: jwt secret
            );
            const userId = decodedToken.userId;

            //find user, mapping user and add to request


        } catch (error) {
            throw new UnauthorizedException();
        }

        return true;
    }
}