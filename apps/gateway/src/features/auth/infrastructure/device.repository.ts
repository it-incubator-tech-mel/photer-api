import {Injectable} from "@nestjs/common";
import {BodyDeviceToDB, DeviceClass} from "../api/dto/Device-type";
import {UserRepository} from "./users.repository";
// import {setting} from "../../../../settings";
import {JwtService} from "@nestjs/jwt";
import process from "process";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
@Injectable()
export class DeviceRepository {
    constructor(
      private userRepository: UserRepository,
      //private jwtService: JwtService
    ) {
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

    async deleteDevice(deviceId: number) {
        return prisma.device.delete({
            where: {id: deviceId}
        })
    }
}