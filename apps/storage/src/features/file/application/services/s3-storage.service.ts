import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3ClientConfig } from '../../../../core/config/s3-client.config';
import { generateFileName } from '../../../../common/utils/generate-file-name.util';
import { FileWithBuffer } from '../use-cases/upload-files.use-case';

@Injectable()
export class S3StorageService {
  private readonly s3Client: S3Client;

  constructor(private readonly config: S3ClientConfig) {
    this.s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async uploadFile(file: FileWithBuffer, userId: number) {
    console.log('file', file);
    console.log('userId', userId);
    try {
      const uniqueFileName: string = generateFileName();
      const extension: string = file.originalname.split('.').pop();
      const s3Key: string = `files/${userId}/${uniqueFileName}.${extension}`;

      console.log(`fileName: ${uniqueFileName}`); // 2025-04-16-1735
      console.log(`extension: ${extension}`); // jpg
      console.log(`s3Key: ${s3Key}`); // files/2/2025-04-16/2025-04-16-1735.jpg

      const command: PutObjectCommand = new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });
      // console.log('command', command);
      // PutObjectCommand {
      //   ...
      //   input: {
      //     Bucket: 'my-test-123',
      //       Key: 'files/2/2025-04-16/2025-04-16-1735.jpg',
      //       Body: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff db 00 43 00 06 04 05 06 05 04 06 06 05 06 07 07 06 08 0a 10 0a 0a 09 09 0a 14 0e 0f 0c ... 61500 more bytes>,
      //       ContentType: 'image/jpeg',
      //       ACL: 'public-read'
      //   }
      // }

      await this.s3Client.send(command);

      // publicBaseUrl - https://storage.yandexcloud.net/my-test-123
      return {
        url: `${this.config.s3PublicUrl}/${s3Key}`, // https://storage.yandexcloud.net/my-test-123/files/2/2025-04-16/2025-04-16-1735.jpg
        s3Key, // files/2/2025-04-16/2025-04-16-1735.jpg
      };
    } catch (error) {
      throw new Error('File upload to S3 failed');
    }
  }
}
