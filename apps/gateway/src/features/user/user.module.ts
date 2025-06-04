import { Module, Provider } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { UserQueryRepository } from './infrastructure/user.query-repository';
import { UserRepository } from './infrastructure/user.repository';

const repos: Provider[] = [UserRepository, UserQueryRepository];

const services: Provider[] = [UserService];

@Module({
  providers: [...repos, ...services],
  exports: [UserService, UserRepository],
})
export class UserModule {}
