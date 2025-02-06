import { INestApplication } from '@nestjs/common';

export const GLOBAL_PREFIX: string = 'api';

export function globalPrefixSetup(app: INestApplication) {
  app.setGlobalPrefix(GLOBAL_PREFIX);
}