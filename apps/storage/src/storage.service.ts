import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';
@Injectable()
export class StorageService {
  s3client: S3Client;
  constructor() {
    const REGION = 'us-east-1';
    this.s3client = new S3Client({
      region: REGION,
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        secretAccessKey: 'YCP3VFx8FUiL5KoPQLNs06zHlW2vitUPD55v68up',
        accessKeyId: 'YCAJERHyJNJ4DYvc9V9B3x63Q',
      },
    });
  }
  async uploadStream(file: { photo: any; userId: number }) {
    const fileName = `posts/${file.userId}/${new Date().toISOString()}-${Math.floor(Math.random() * 10000)}`;
    const bucketParam = {
      Bucket: 'inctagram-photer',
      Key: `${fileName}.png`,
      Body: file.photo.buffer,
      ContentType: 'image/png',
    };
    const command = new PutObjectCommand(bucketParam);
    const photos = await this.s3client.send(command);
    return {
      key: fileName,
      location: [
        `https://storage.yandexcloud.net/${bucketParam.Bucket}/${fileName}.png`,
      ],
      photos,
    };
  }

  getHello(): string {
    return 'Hello World!';
  }
}
