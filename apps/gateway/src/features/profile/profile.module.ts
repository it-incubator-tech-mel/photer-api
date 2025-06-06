import { Module, Provider } from '@nestjs/common';
import { ProfileController } from './api/profile.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ProfileRepository } from './infrastructure/profile.repository';
import { ProfileQueryRepository } from './infrastructure/profile.query-repository';
import { CreateProfileUseCase } from './application/use-case/create-profile.use-case';
import { UpdateProfileUseCase } from './application/use-case/update-profile.use-case';
import { UserModule } from '../user/user.module';
import { DeleteProfileUseCase } from './application/use-case/delete-profile.use-case';

const useCases: Provider[] = [
  CreateProfileUseCase,
  UpdateProfileUseCase,
  DeleteProfileUseCase,
];

const repos: Provider[] = [ProfileRepository, ProfileQueryRepository];
@Module({
  imports: [CqrsModule, UserModule],
  controllers: [ProfileController],
  providers: [...repos, ...useCases],
})
export class ProfileModule {}
