import { Injectable } from "@nestjs/common";
import { BodyDeviceToDB, DeviceClass } from "../../auth/api/dto/Device-type";
import { PrismaService } from '../../../prisma/prisma.service';
import { Device } from '../domain/device.entity';

@Injectable()
export class DeviceRepository {
    constructor(
      private prisma: PrismaService
    ) {
    }

    async create(device: Device): Promise<void> {
        await this.prisma.device.create({
            data: {
                userId: device.getUserId(),
                deviceName: device.getDeviceName(),
                ip: device.getIp(),
                iat: device.getIat(),
                exp: device.getExp(),
            }
        });
    }

    async createDeviceAndSaveToDB(device: DeviceClass, userId: number) {
        // const user = await this.usersRepository.findById(userId)
        //
        // return prisma.device.create({
        //     data: {
        //         ip: device.ip,
        //         title: device.title,
        //         lastActiveDate: device.lastActiveDate,
        //         user: user
        //     }
        // })
    }

    async addDeviceInDB(token: BodyDeviceToDB, refreshToken: string) {
        // const parser = await this.jwtService.verify(refreshToken, {
        //     secret: process.env.JWT_REFRESH_SECRET,
        // });
        // await prisma.device.update({
        //     where: {
        //         id: token.id
        //     },
        //     data:  {
        //         iat: parser.iat,
        //         exp: parser.exp,
        //     }
        // })
        //
        // return true;
    }
    async updateDevice(parser: RefreshTokenPayload) {
        return prisma.device.update({
            where: {
                id: parser.deviceId},
            data: {
                iat: parser.iat,
                exp: parser.exp
            }})
    }

    async deleteDevice(deviceId: number) {
        return prisma.device.delete({
            where: {id: deviceId}
        })
    }
}