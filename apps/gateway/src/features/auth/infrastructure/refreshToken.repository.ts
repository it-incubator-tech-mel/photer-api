import {PrismaService} from "../../../prisma/prisma.service";
import {JwtService} from "@nestjs/jwt";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class RefreshTokenRepo {
    constructor(
        private jwtService: JwtService,
        private prismaService: PrismaService,
        private configService: ConfigService<any, true>
    ) {}

    async deleteRefreshTokenInData(refreshToken: string): Promise<any> {
        const parser = await this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET')
        });

        return this.prismaService.refreshToken.delete({where: {
                userId: +parser.userId,
                deviceId: +parser.deviceId,
                iat: +parser.iat,
            }});
    }
}