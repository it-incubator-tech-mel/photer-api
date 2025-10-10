import { Injectable } from '@nestjs/common';
import { DeviceRepository } from '../../infrastructure/device.repository';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SoftDeleteExpiredDevicesJob {
  constructor(private readonly deviceRepository: DeviceRepository) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handle() {
    const deletedCount = await this.deviceRepository.softDeleteExpiredDevices();
    console.log(`Soft-deleted ${deletedCount} expired devices`);
  }
}
