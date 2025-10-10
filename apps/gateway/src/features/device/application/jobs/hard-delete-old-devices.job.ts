import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DeviceRepository } from '../../infrastructure/device.repository';

@Injectable()
export class HardDeleteOldDevicesJob {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  @Cron('0 3 * * *') // every day in 3 am
  async handle() {
    const deletedCount = await this.deviceRepository.hardDeleteOldDevices();
    console.log(`Hard-deleted ${deletedCount} old devices`);
  }
}
