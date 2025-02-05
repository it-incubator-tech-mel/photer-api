import { ConfigModule } from '@nestjs/config';
import { DynamicModule } from '@nestjs/common';

export const configModule: Promise<DynamicModule> = ConfigModule.forRoot({
  envFilePath: [
    process.env.ENV_FILE_PATH?.trim() || '',
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    '.env.production',
  ],
  isGlobal: true, // Make global configuration for all app
});
