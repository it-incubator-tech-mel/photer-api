import { ConfigModule } from '@nestjs/config';
import { DynamicModule } from '@nestjs/common';

export const configModule: Promise<DynamicModule> = ConfigModule.forRoot({
  envFilePath: [
    process.env.ENV_FILE_PATH?.trim() || '',
    `.env.${process.env.ENV_TYPE}.local`,
    `.env.${process.env.ENV_TYPE}`,
    '.env.production',
  ],
  isGlobal: true, // Make global configuration for all app
});
