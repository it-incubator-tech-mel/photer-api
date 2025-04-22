import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IsString } from 'class-validator';
import { configValidation } from './config-validation';

@Injectable()
export class S3ClientConfig {
  constructor(private configService: ConfigService<any, true>) {
    // console.log('in S3ClientConfig', configService);
    configValidation.validateConfig(this);
  }

  @IsString({
    message: 'Set Env variable S3_REGION, example: S3_REGION',
  })
  region: string = this.configService.get<string>('S3_REGION');

  @IsString({
    message: 'Set Env variable S3_ENDPOINT, example: S3_ENDPOINT',
  })
  endpoint: string = this.configService.get<string>('S3_ENDPOINT');

  @IsString({
    message: 'Set Env variable S3_ACCESS_KEY_ID, example: S3_ACCESS_KEY_ID',
  })
  accessKeyId: string = this.configService.get<string>('S3_ACCESS_KEY_ID');

  @IsString({
    message:
      'Set Env variable S3_SECRET_ACCESS_KEY, example: S3_SECRET_ACCESS_KEY',
  })
  secretAccessKey: string = this.configService.get<string>(
    'S3_SECRET_ACCESS_KEY',
  );

  @IsString({
    message: 'Set Env variable S3_BUCKET_NAME, example: S3_BUCKET_NAME',
  })
  bucketName: string = this.configService.get<string>('S3_BUCKET_NAME');

  @IsString({
    message: 'Set Env variable S3_PUBLIC_URL_BASE, example: S3_PUBLIC_URL_BASE',
  })
  s3PublicUrl: string = this.configService.get<string>('S3_PUBLIC_URL_BASE');
}
