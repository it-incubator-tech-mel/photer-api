import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

/**
 * Custom interceptor for uploading files.
 *
 * * 1. Inherits from NestInterceptor by implementing the intercept() method
 * * 2. Internally, it uses the built-in Files Interceptor with settings:
 * - Accepts files from the "photos" form field
 * - Maximum of 10 files (20MB each)
 * - Stores files in RAM (memory Storage)
 * - Filters by MIME types: JPEG/PNG only
 * * 3. In case of validation errors, it throws a Bad Request Exception.
 *
 * Usage: @UseInterceptors(FileUploadInterceptor) in the controller
 */

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private interceptor: NestInterceptor;

  constructor() {
    const InterceptorClass = FilesInterceptor('photos', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024, // 20Mb
        files: 10, // max 10 photos
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException([
              {
                message: 'Invalid file format. Only JPEG/PNG are allowed.',
                field: 'photos',
              },
            ]),
            false,
          );
        }
      },
    });
    this.interceptor = new InterceptorClass();
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    return this.interceptor.intercept(context, next);
  }
}
