import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

// HttpException caught: Too many files

// {
//   "errorsMessages": [
//   "Too many files"
// ]
// }

// HttpException caught: File too large

// {
//   "statusCode": 413,
//   "message": "File too large",
//   "timestamp": "2025-04-11T11:08:48.363Z",
//   "path": "/api/v1/posts?photos"
// }

/**
 * MulterExceptionFilter handles MulterError thrown by NestJS.
 */

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    console.log('MulterError caught:', exception.code, exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST; // Все ошибки Multer будут 400
    const errorsMessages = [];

    console.log('MulterExceptionFilter caught:', exception.message);

    // handle MulterError codes
    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        errorsMessages.push({
          message: 'File size exceeds 20MB limit',
          field: 'photos',
        });
        break;

      case 'LIMIT_FILE_COUNT':
        errorsMessages.push({
          message: 'Maximum 10 files allowed',
          field: 'photos',
        });
        break;

      case 'LIMIT_UNEXPECTED_FILE':
        errorsMessages.push({
          message: 'Unexpected file field name',
          field: exception.field || 'unknown',
        });
        break;

      default:
        errorsMessages.push({
          message: exception.message,
          field: 'photos',
        });
    }

    response.status(status).json({
      errorsMessages,
    });
  }
}
