export class UploadedFileInputDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: string; // base64
  size: number;
}

export class UploadFilesInputDto {
  files: UploadedFileInputDto[];
  userId: number;
}

export class UploadFilesOutputDto {
  urls: string[];
}
