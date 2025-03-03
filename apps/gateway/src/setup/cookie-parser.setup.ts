import * as cookieParser from 'cookie-parser';
import { INestApplication } from '@nestjs/common';

export function cookieParserSetup(app: INestApplication) {
  app.use(cookieParser());
}
