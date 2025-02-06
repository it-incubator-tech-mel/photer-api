import { globalPrefixSetup } from './global-prefix.setup';
import { INestApplication } from '@nestjs/common';

export function appSetup(app: INestApplication) {
  globalPrefixSetup(app);
}