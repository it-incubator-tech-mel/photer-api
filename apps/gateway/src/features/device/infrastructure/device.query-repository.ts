import { PrismaService } from '../../../prisma/prisma.service';
import { DeviceOutputDto } from '../api/dto/output/device-output.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DevicesQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number): Promise<DeviceOutputDto[]> {
    const result = await this.prisma.device.findMany({
      where: {
        userId: userId,
        isDeleted: false,
      },
    });

    if (!result || result.length === 0) {
      return [];
    }

    return result.map((d) => {
      return this.mapToOutput(d);
    });
  }

  mapToOutput(device): DeviceOutputDto {
    return {
      ip: device.ip,
      title: device.deviceName,
      lastActiveDate: device.iat,
      deviceId: device.id,
    };
  }
}
