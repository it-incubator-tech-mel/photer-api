import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/*
 *  For mandatory file availability verification
 *  @UploadedFiles() extracts them from req.files.photos
 *   FilesRequiredPipe receives an array of files (even an empty one)
 *   If there are no files, an exception is thrown.
 *   If there are files, → they are transferred to the controller
 */

@Injectable()
export class FilesRequiredPipe implements PipeTransform {
  transform(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException({
        message: 'At least one file is required',
        field: 'photos',
      });
    }
    return files;
  }
}
