import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * HttpExceptionFilter handles standard HTTP exceptions thrown by NestJS.
 *
 * When it triggers:
 * - When NestJS throws an HttpException (like 400 Bad Request, 404 Not Found, etc.).
 * - For example, when validation pipes fail or a route is not found.
 *
 */

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.log('HttpException caught:', exception.message);

    if (status === HttpStatus.BAD_REQUEST) {
      const responseBody: any = exception.getResponse();
      return response.status(status).json({
        errorsMessages: Array.isArray(responseBody.message)
          ? responseBody.message
          : [responseBody.message],
      });
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
