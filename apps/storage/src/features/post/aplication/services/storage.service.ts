import { Injectable } from '@nestjs/common';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { S3ClientConfig } from '../../../../config/s3-client.config';

@Injectable()
export class StorageService {
  private readonly s3client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(private readonly s3ClientConfig: S3ClientConfig) {
    this.bucket = s3ClientConfig.bucketName;
    this.endpoint = s3ClientConfig.endpoint;

    this.s3client = new S3Client({
      region: s3ClientConfig.region,
      endpoint: s3ClientConfig.endpoint,
      credentials: {
        secretAccessKey: s3ClientConfig.secretAccessKey,
        accessKeyId: s3ClientConfig.accessKeyId,
      },
    });
  }

  async uploadFile(
    buffer: Buffer,
    mimetype: string,
    userId: number,
    originalName: string,
  ) {
    const fileName: string = this.generateFileName(userId, originalName);

    const uploadParams = {
      Bucket: this.bucket,
      Key: fileName,
      Body: buffer,
      ContentType: mimetype || 'application/octet-stream',
      ContentLength: buffer.length,
    };

    const command: PutObjectCommand = new PutObjectCommand(uploadParams);

    try {
      const result: PutObjectCommandOutput = await this.s3client.send(command);

      if (result.$metadata.httpStatusCode !== 200) {
        throw new Error('S3 returned a non-200 status');
      }

      const location: string = `${this.s3ClientConfig.s3PublicUrl}/${fileName}`;

      return {
        key: fileName,
        location: location,
        etag: result.ETag,
      };
    } catch (e) {
      throw new Error('File uploading failed');
    }
  }

  private generateFileName(userId: number, originalName: string): string {
    const extension: string = originalName.split('.').pop();
    return `files/${userId}/${new Date().toISOString().split('T')[0]}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;
  }

  async deleteFile(key: string): Promise<void> {
    try {
      // key files/2/2025-04-24/1745502769705-392.jpg
      const trashKey: string = `trash/${key}`;

      const copyResult = await this.s3client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `${this.bucket}/${key}`,
          Key: trashKey,
        }),
      );

      if (copyResult.$metadata.httpStatusCode !== 200) {
        throw new Error('S3 copy failed');
      }

      const deleteResult = await this.s3client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      if (deleteResult.$metadata.httpStatusCode !== 204) {
        throw new Error('S3 delete failed');
      }
    } catch (e) {
      throw new Error('File deletion failed');
    }
  }
}
