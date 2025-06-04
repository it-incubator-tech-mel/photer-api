import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DeviceRepository } from './infrastructure/device.repository';
import { DeviceController } from './api/device.controller';
import { TerminateAllOtherUserDevicesUseCase } from './application/use-cases/terminate-all-other-user-devices.use-case';
import { TerminateUserDeviceUseCase } from './application/use-cases/terminate-user-device.use-case';
import { DevicesQueryRepository } from './infrastructure/device.query-repository';

const useCases: Provider[] = [
  TerminateAllOtherUserDevicesUseCase,
  TerminateUserDeviceUseCase,
];

const repos: Provider[] = [DeviceRepository, DevicesQueryRepository];

@Module({
  imports: [CqrsModule],
  controllers: [DeviceController],
  providers: [...useCases, ...repos],
  exports: [DeviceRepository],
})
export class DeviceModule {}
