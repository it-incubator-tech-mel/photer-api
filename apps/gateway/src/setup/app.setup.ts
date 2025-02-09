import { globalPrefixSetup } from './global-prefix.setup';
import { INestApplication } from '@nestjs/common';
import { exceptionFiltersSetup } from './exception-filters.setup';

export function appSetup(app: INestApplication) {
  globalPrefixSetup(app);
  exceptionFiltersSetup(app);
}