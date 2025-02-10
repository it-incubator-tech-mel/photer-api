import { globalPrefixSetup } from './global-prefix.setup';
import { INestApplication } from '@nestjs/common';
import { exceptionFiltersSetup } from './exception-filters.setup';
import { pipesSetup } from './pipes.setup';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  globalPrefixSetup(app);
  exceptionFiltersSetup(app);
}