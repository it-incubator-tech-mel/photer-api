import { Module, Provider } from '@nestjs/common';
import { SubscriptionRepository } from './infrastructure/subscription.repository';
import { SubscriptionController } from './api/subscription.controller';
import { SubscriptionListener } from './api/subscription.listener';
import { ActivateSubscriptionUseCase } from './application/use-cases/activate-subscription.usecase';
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription.usecase';
import { UserModule } from '../user/user.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

const repos: Provider[] = [SubscriptionRepository];

const useCases: Provider[] = [
  CreateSubscriptionUseCase,
  ActivateSubscriptionUseCase,
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
