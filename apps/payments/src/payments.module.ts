import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StripeController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ConfigModule } from '@nestjs/config';
import { RawBodyMiddleware } from '../middleware/raw-body.middleware';

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
  ],
  controllers: [StripeController],
  providers: [PaymentsService],
})
export class PaymentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RawBodyMiddleware).forRoutes('stripe/webhook');
  }
}
