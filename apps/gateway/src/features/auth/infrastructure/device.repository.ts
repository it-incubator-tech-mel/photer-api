import {Injectable} from "@nestjs/common";
import {BodyDeviceToDB, DeviceClass} from "../api/dto/Device-type";
import {JwtService} from "@nestjs/jwt";
import process from "process";
import {UserRepository} from "./users.repository";
import {PrismaService} from "../../../prisma/prisma.service";
@Injectable()
export class DeviceRepository {
    constructor(
      private userRepository: UserRepository,
      private jwtService: JwtService,
      private prisma: PrismaService
    ) {
    }
    async createDeviceAndSaveToDB(device: DeviceClass, userId: number) {
        return this.prisma.device.create({
            data: {
                ip: device.ip,
                title: device.title,
                lastActiveDate: device.lastActiveDate,
                userId: userId
            }
        })
    }
    async updateTimeDeviceInDB(token: BodyDeviceToDB, refreshToken: string) {
        const parser = await this.jwtService.verify(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET,
        });
        await this.prisma.device.update({
            where: {
                id: token.id
            },
            data:  {
                iat: parser.iat,
                exp: parser.exp,
            }
        })

        return true;
    }
}