import { globalPrefixSetup } from './global-prefix.setup';

export function appSetup(app: INestApplication) {
  globalPrefixSetup(app);
}