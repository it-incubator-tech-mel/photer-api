import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";

import {RefreshTokenRepo} from "../../infrastructure/refreshToken.repository";
import {ConfigService} from "@nestjs/config";
import { Notification } from '../../../../core/notification/notification';
import {
    AccessTokenPayload,
    JwtServiceProvider,
    RefreshTokenPayload
} from "../../../../core/services/jwt/jwt-service-provider.service";
import {JwtService} from "@nestjs/jwt";
import {DeviceRepository} from "../../../devices/infrastructure/device.repository";


export class RefreshTokenCommand {
    constructor(
        public readonly refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCase
    implements ICommandHandler<RefreshTokenCommand> {
    constructor(
        private readonly jwtService: JwtService,
        private readonly jwtServiceProvider: JwtServiceProvider,
        private readonly deviceRep: DeviceRepository,
        private readonly refreshTokenRepo: RefreshTokenRepo,
        private configService: ConfigService<any, true>
    ) {}
    async execute(command: RefreshTokenCommand){
        const decodedRefreshToken: RefreshTokenPayload = await this.jwtService.decode<RefreshTokenPayload>(command.refreshToken);
        return  this.createAccessTokenAndRefreshToken(decodedRefreshToken)
    }

    async createAccessTokenAndRefreshToken(payload: RefreshTokenPayload){

        const JwtAccessTokenPayload: AccessTokenPayload = { userId: payload.userId };
        const JwtRefreshTokenPayload: RefreshTokenPayload = { userId: payload.userId, deviceId: payload.deviceId };

        const accessToken: string = await this.jwtServiceProvider.generateAccessToken(JwtAccessTokenPayload);
        const refreshToken: string = await this.jwtServiceProvider.generateRefreshToken(JwtRefreshTokenPayload);
        const parser = await this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET')
        })
        try {
            await Promise.all([
                this.deviceRep.updateDevice(parser),
                this.refreshTokenRepo.updateRefreshToken(parser)
            ])
            return Notification.success({
                accessToken,
                refreshToken,
            });
        }catch (e){}

    }

}