import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DeviceRepository } from './infrastructure/device.repository';
import { DeviceController } from './api/device.controller';
import { TerminateAllOtherUserDevicesUseCase } from './application/use-cases/terminate-all-other-user-devices.use-case';
import { TerminateUserDeviceUseCase } from './application/use-cases/terminate-user-device.use-case';
import { DevicesQueryRepository } from './infrastructure/device.query-repository';
import { SoftDeleteExpiredDevicesJob } from './application/jobs/soft-delete-expired-devices.job';
import { HardDeleteOldDevicesJob } from './application/jobs/hard-delete-old-devices.job';

const useCases: Provider[] = [
  TerminateAllOtherUserDevicesUseCase,
  TerminateUserDeviceUseCase,
];

const repos: Provider[] = [DeviceRepository, DevicesQueryRepository];

const jobs: Provider[] = [SoftDeleteExpiredDevicesJob, HardDeleteOldDevicesJob];

@Module({
  imports: [CqrsModule],
  controllers: [DeviceController],
  providers: [...useCases, ...repos, ...jobs],
  exports: [DeviceRepository],
})
export class DeviceModule {}
