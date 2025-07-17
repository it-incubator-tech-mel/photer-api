import { Module, Provider } from '@nestjs/common';
import { SubscriptionRepository } from './infrastructure/subscription.repository';
import { SubscriptionController } from './api/subscription.controller';
import { SubscriptionListener } from './api/subscription.listener';
import { ActivateSubscriptionUseCase } from './application/use-cases/activate-subscription.usecase';
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription.usecase';
import { UserModule } from '../user/user.module';
import { CqrsModule } from '@nestjs/cqrs';

const repos: Provider[] = [SubscriptionRepository];

const useCases: Provider[] = [
  CreateSubscriptionUseCase,
  ActivateSubscriptionUseCase,
];

@Module({
  imports: [CqrsModule, UserModule],
  controllers: [SubscriptionController, SubscriptionListener],
  providers: [...repos, ...useCases],
  exports: [],
})
export class SubscriptionModule {}
