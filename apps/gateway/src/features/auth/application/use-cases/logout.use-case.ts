import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {DeviceRepository} from "../../infrastructure/device.repository";
import {RefreshTokenRepo} from "../../infrastructure/refreshToken.repository";
import {Result} from "../../../../../base/object-result";

export class LogoutCommand {
    constructor(public readonly refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutCase
    implements ICommandHandler<LogoutCommand> {
    constructor(
        private readonly jwtService: JwtService,
        private readonly deviceRep: DeviceRepository,
        private readonly refreshTokenRepo: RefreshTokenRepo,
    ) {}
    async execute(command: LogoutCommand){
        const decodedRefreshToken: RefreshTokenPayload = await this.jwtService.decode<RefreshTokenPayload>(command.refreshToken);
        const deletingDevice = await this.deviceRep.deleteDevice(+decodedRefreshToken.deviceId)
        const validToken = await this.refreshTokenRepo.deleteRefreshToken(command.refreshToken);
        if (deletingDevice && validToken){
            return true
        } else {
            return Result.forbidden()
        }
    }
}