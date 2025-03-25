import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomError } from './exceptions/custom-error';

/**
 * Handles custom application errors (CustomError).
 *
 * When it triggers:
 * - When the application throws a CustomError (manually created errors).
 *
 * What it does:
 * - Returns detailed error messages if the error is known.
 * - Useful for validation errors or business logic errors you define yourself.
 */

@Catch(CustomError)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log('Custom error caught:', exception.message);

    if (exception.statusCode === HttpStatus.BAD_REQUEST) {
      return response.status(exception.statusCode).json({
        errorsMessages: exception.errorMessages || [
          { message: 'Unknown error', field: 'unknown' },
        ],
      });
    }

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
