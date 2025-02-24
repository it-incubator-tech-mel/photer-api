import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DeviceRepository } from './infrastructure/device.repository';

const repos: Provider[] = [
  DeviceRepository
]

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [...repos],
  exports: [DeviceRepository]
})
export class DeviceModule {}