import { globalPrefixSetup } from './global-prefix.setup';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { exceptionFiltersSetup } from './exception-filters.setup';
import { pipesSetup } from './pipes.setup';
import { swaggerSetup } from './swagger.setup';
import { cookieParserSetup } from './cookie-parser.setup';
import { corsSetup } from './cors.setup';

export function appSetup(app: INestApplication) {
  corsSetup(app);
  cookieParserSetup(app);
  pipesSetup(app);
  globalPrefixSetup(app);
  exceptionFiltersSetup(app);
  swaggerSetup(app);
}
