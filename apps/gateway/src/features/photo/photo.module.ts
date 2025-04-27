import { CqrsModule } from '@nestjs/cqrs';
import { Module, Provider } from '@nestjs/common';
import { PhotoRepository } from './infrastructure/photo.repository';

const useCases: Provider[] = [];

const repos: Provider[] = [PhotoRepository];

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [...useCases, ...repos],
  exports: [],
})
export class PhotoModule {}
