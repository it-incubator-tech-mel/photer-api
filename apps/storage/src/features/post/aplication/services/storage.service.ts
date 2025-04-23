import { Injectable } from '@nestjs/common';
import {
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

  async deleteFile(key: string): Promise<void> {
    const deleteParams = {
      Bucket: this.bucket,
      Key: key,
    };

    try {
      await this.s3client.send(new DeleteObjectCommand(deleteParams));
    } catch (e) {
      throw new Error('File deletion failed');
    }
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

    let photos: PutObjectCommandOutput;
    try {
      photos = await this.s3client.send(command);
    } catch (e) {
      throw new Error('File uploading failed');
    }

    const location: string = `https://${this.endpoint}/${this.bucket}/${fileName}`;

    return {
      key: fileName,
      location: [location],
      photos,
    };
  }

  private generateFileName(userId: number, originalName: string): string {
    const extension: string = originalName.split('.').pop();
    return `files/${userId}/${new Date().toISOString().split('T')[0]}/${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;
  }
}
