import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {RefreshTokenRepository} from "../../infrastructure/refresh-token.repository";
import {DeviceRepository} from "../../../devices/infrastructure/device.repository";
import {RefreshTokenPayload} from "../../../../core/services/jwt/jwt-token.service";
import { Notification } from '../../../../core/notification/notification';

export class LogoutCommand {
    constructor(public readonly refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutCase
    implements ICommandHandler<LogoutCommand> {
    constructor(
        private readonly jwtService: JwtService,
        private readonly deviceRep: DeviceRepository,
        private readonly refreshTokenRepo: RefreshTokenRepository,
    ) {}
    async execute(command: LogoutCommand){
        const decodedRefreshToken: RefreshTokenPayload = await this.jwtService.decode<RefreshTokenPayload>(command.refreshToken);
        const deletingDevice = await this.deviceRep.deleteDevice(decodedRefreshToken.deviceId)
        const validToken = await this.refreshTokenRepo.delete(command.refreshToken);
        if (deletingDevice && validToken){
            return true
        } else {
            return Notification.forbidden()
        }
    }
}