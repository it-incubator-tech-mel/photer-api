import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { YandexConfig } from './config/Yandex-config';
@Injectable()
export class StorageService {
  s3client: S3Client;
  constructor(private readonly yandexConfig: YandexConfig) {
    const REGION = 'us-east-1';
    this.s3client = new S3Client({
      region: REGION,
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        secretAccessKey: yandexConfig.yandexSecret,
        accessKeyId: yandexConfig.yandexAccess,
      },
    });
  }
  async uploadStream(command: PutObjectCommand, bucketParam: any) {
    // const fileName = `posts/${file.userId}/${new Date().toISOString()}-${Math.floor(Math.random() * 10000)}`;
    // const bucketParam = {
    //   Bucket: 'inctagram-photer',
    //   Key: `${fileName}.png`,
    //   Body: file.photo.buffer,
    //   mimetype: file.photo.mimetype,
    // };
    // const command = new PutObjectCommand(bucketParam);
    const photos = await this.s3client.send(command);
    return {
      key: bucketParam.key,
      location: [
        `https://storage.yandexcloud.net/${bucketParam.Bucket}/${bucketParam.key}.png`,
      ],
      photos,
    };
  }

  getHello(): string {
    return 'Hello World!';
  }
}
