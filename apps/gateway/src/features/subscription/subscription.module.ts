import { Module, Provider } from '@nestjs/common';
import { SubscriptionRepository } from './infrastructure/subscription.repository';
import { SubscriptionController } from './api/subscription.controller';
import { SubscriptionListener } from './api/subscription.listener';
import { ActivateSubscriptionUseCase } from './application/use-cases/commands/activate-subscription.usecase';
import { CreateSubscriptionUseCase } from './application/use-cases/commands/create-subscription.usecase';
import { UserModule } from '../user/user.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GetMyPaymentsUseCase } from './application/use-cases/queries/get-my-payments.use-case';
import { GetMySubscriptionsUseCase } from './application/use-cases/queries/get-my-subscriptions.use-case';
import { SubscriptionQueryRepository } from './infrastructure/subscription.query-repository';
import { CancelAutoRenewalUseCase } from './application/use-cases/commands/cancel-auto-renewal.usecase';
import { EnableAutoRenewalUseCase } from './application/use-cases/commands/enable-auto-renewal.use-case';

const repos: Provider[] = [SubscriptionRepository, SubscriptionQueryRepository];

const useCases: Provider[] = [
  CreateSubscriptionUseCase,
  ActivateSubscriptionUseCase,
  GetMyPaymentsUseCase,
  GetMySubscriptionsUseCase,
  CancelAutoRenewalUseCase,
  EnableAutoRenewalUseCase,
];

@Module({
  imports: [
    // Register hte producer for sending messages to the queue
    ClientsModule.registerAsync([
      {
        name: 'PAYMENTS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'payments_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    CqrsModule,
    UserModule,
  ],
  controllers: [SubscriptionController, SubscriptionListener],
  providers: [...repos, ...useCases],
  exports: [],
})
export class SubscriptionModule {}
