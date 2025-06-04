import { Module, Provider } from '@nestjs/common';
import { ProfileController } from './api/profile.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ProfileRepository } from './infrastructure/profile.repository';
import { ProfileQueryRepository } from './infrastructure/profile.query-repository';
import { UserModule } from '../users/user.module';
import { CreateProfileUseCase } from './application/use-case/create-profile.use-case';

const useCases: Provider[] = [CreateProfileUseCase];

const repos: Provider[] = [ProfileRepository, ProfileQueryRepository];
@Module({
  imports: [CqrsModule, UserModule],
  controllers: [ProfileController],
  providers: [...repos, ...useCases],
})
export class ProfileModule {}
