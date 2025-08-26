import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './domain/payment.entity';
import { SubscriptionEntity } from './domain/subscription.entity';
import { StripeService } from './application/services/stripe.service';
import { PaymentsController } from './api/payments.controller';
import { PaymentsService } from './application/services/payments.service';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentsQueryRepository } from './infrastructure/repositories/payments.query-repository';
import { GetMyPaymentsUseCase } from './application/use-cases/queries/get-my-payments.use-case';
import { HandlePaymentUseCase } from './application/use-cases/commands/handle-payment.use-case';
import { DisableAutoRenewalUseCase } from './application/use-cases/commands/disable-auto-renewal.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        process.env.ENV_FILE_PATH?.trim() || '',
        `.env.${process.env.ENV_TYPE}.local`,
        `.env.${process.env.ENV_TYPE}`,
        '.env.production',
      ],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('PAYMENTS_DB_URL'),
        entities: [PaymentEntity, SubscriptionEntity],
        synchronize: true,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    CqrsModule,
    TypeOrmModule.forFeature([PaymentEntity, SubscriptionEntity]),
    ClientsModule.registerAsync([
      {
        name: 'GATEWAY_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: 'gateway_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [PaymentsController],
  providers: [
    StripeService,
    PaymentsService,
    GetMyPaymentsUseCase,
    HandlePaymentUseCase,
    DisableAutoRenewalUseCase,
    PaymentsQueryRepository,
  ],
})
export class PaymentsModule {}
