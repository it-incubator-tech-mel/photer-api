import { Module, Provider } from '@nestjs/common';
import { ProfileController } from './api/profile.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ProfileRepository } from './infrastructure/profile.repository';
import { ProfileQueryRepository } from './infrastructure/profile.query-repository';
import { CreateProfileUseCase } from './application/use-case/create-profile.use-case';
import { UserModule } from '../user/user.module';

const useCases: Provider[] = [CreateProfileUseCase];

const repos: Provider[] = [ProfileRepository, ProfileQueryRepository];
@Module({
  imports: [CqrsModule, UserModule],
  controllers: [ProfileController],
  providers: [...repos, ...useCases],
})
export class ProfileModule {}
