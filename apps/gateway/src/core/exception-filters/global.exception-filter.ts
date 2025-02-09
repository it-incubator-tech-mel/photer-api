import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * Catches all unhandled errors in the application.
 *
 * When it triggers:
 * - When an unexpected error occurs that isn’t handled by other filters.
 * - For example, runtime errors, bugs, or exceptions from third-party libraries.
 *
 * What it does:
 * - Prevents the application from crashing.
 * - Returns a generic "Internal Server Error" message to avoid exposing sensitive details.
 * - Logs the error to help with debugging.
 */


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error('Unhandled error:', exception);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
