import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export function createFilesInterceptor() {
  return FilesInterceptor('photos', 10, {
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
}
