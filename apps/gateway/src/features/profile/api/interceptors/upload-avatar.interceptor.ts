import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

/**
 * Custom interceptor for uploading files.
 *
 * * 1. Inherits from NestInterceptor by implementing the intercept() method
 * * 2. Internally, it uses the built-in Files Interceptor with settings:
 * - Accepts files from the "avatar" form field
 * - Maximum size is 10MB
 * - Stores files in RAM (memory Storage)
 * - Filters by MIME types: JPEG/PNG only
 * - Filters by ext .jpeg/.png
 * * 3. In case of validation errors, it throws a Bad Request Exception.
 *
 * Usage: @UseInterceptors(UploadAvatarInterceptor) in the controller
 */

@Injectable()
export class UploadAvatarInterceptor implements NestInterceptor {
  private interceptor: NestInterceptor;

  constructor() {
    const InterceptorClass = FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10Mb
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes: string[] = ['image/jpeg', 'image/png'];
        const allowedExtensions: string[] = ['.jpg', '.jpeg', '.png'];
        const ext: string = file.originalname
          .substring(file.originalname.lastIndexOf('.'))
          .toLowerCase();

        if (
          allowedMimeTypes.includes(file.mimetype) &&
          allowedExtensions.includes(ext)
        ) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException([
              {
                message:
                  'The photo must be less than 10 Mb and have JPEG or PNG format',
                field: 'avatar',
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
