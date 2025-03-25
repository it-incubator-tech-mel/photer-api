import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Device } from '../domain/device.entity';

@Injectable()
export class DeviceRepository {
  constructor(private prisma: PrismaService) {}

  async create(device: Device): Promise<boolean> {
    try {
      const createdDevice = await this.prisma.device.create({
        data: {
          id: device.getId(),
          userId: device.getUserId(),
          deviceName: device.getDeviceName(),
          ip: device.getIp(),
          iat: device.getIat(),
          exp: device.getExp(),
        },
      });

      return !!createdDevice;
    } catch (error) {
      return false;
    }
  }

  async findOneByDeviceIdAndIat(
    deviceId: string,
    iat: string,
  ): Promise<Device | null> {
    const prismaDevice = await this.prisma.device.findFirst({
      where: {
        id: deviceId,
        iat: iat,
        isDeleted: false,
      },
    });

    return prismaDevice ? this.mapToDomain(prismaDevice) : null;
  }

  async findByDeviceId(deviceId: string): Promise<Device | null> {
    const prismaDevice = await this.prisma.device.findUnique({
      where: {
        id: deviceId,
        isDeleted: false,
      },
    });

    return prismaDevice ? this.mapToDomain(prismaDevice) : null;
  }

  async updateIat(deviceId: string, iat: string): Promise<boolean> {
    try {
      const result = await this.prisma.device.update({
        where: { id: deviceId, isDeleted: false },
        data: {
          iat: iat,
        },
      });

      return !!result;
    } catch (error) {
      return false;
    }
  }

  async deleteOneByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
  ): Promise<boolean> {
    const result = await this.prisma.device.update({
      where: {
        id: deviceId,
        userId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    return result.isDeleted === true;
  }

  async deleteOneByDeviceIdAndIAt(
    deviceId: string,
    iat: string,
  ): Promise<boolean> {
    const result = await this.prisma.device.update({
      where: {
        id: deviceId,
        iat,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    return result.isDeleted === true;
  }

  async deleteAllOtherByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
  ): Promise<boolean> {
    const result = await this.prisma.device.updateMany({
      where: {
        userId,
        id: { not: deviceId },
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    return result.count > 0;
  }

  private mapToDomain(prismaDevice: any): Device {
    return Device.restore(
      prismaDevice.id,
      prismaDevice.userId,
      prismaDevice.deviceName,
      prismaDevice.ip,
      prismaDevice.iat,
      prismaDevice.exp,
      prismaDevice.isDeleted,
    );
  }
}
