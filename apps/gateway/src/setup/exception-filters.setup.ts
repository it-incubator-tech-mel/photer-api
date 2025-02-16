import { INestApplication } from '@nestjs/common';
import { CoreConfig } from '../core/config/core.config';
import { CustomExceptionFilter } from '../core/exception-filters/custom.exception-filter';
import { HttpExceptionFilter } from '../core/exception-filters/http.exception-filter';
import { GlobalExceptionFilter } from '../core/exception-filters/global.exception-filter';

export function exceptionFiltersSetup(app: INestApplication) {
  app.useGlobalFilters(
    new CustomExceptionFilter(),
    new HttpExceptionFilter(),
    // new GlobalExceptionFilter(),
  );
}
