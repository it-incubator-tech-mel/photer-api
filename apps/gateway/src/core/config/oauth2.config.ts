import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsString } from 'class-validator';
import { configValidation } from './config-validation';

@Injectable()
export class Oauth2Config {
  constructor(private configService: ConfigService<any, true>) {
    // console.log('in Oauth2Config', Oauth2Config);
    configValidation.validateConfig(this);
  }

  @IsString({
    message: 'Set Env variable GOOGLE_CLIENT_SECRET, example: my_secret',
  })
  googleClientSecret: string = this.configService.get<string>(
    'GOOGLE_CLIENT_SECRET',
  );

  @IsString({
    message: 'Set Env variable GOOGLE_CLIENT, example: my_secret',
  })
  googleClient: string = this.configService.get<string>('GOOGLE_CLIENT');

  @IsString({
    message: 'Set Env variable GITHUB_CLIENT_SECRET, example: my_secret',
  })
  githubClientSecret: string = this.configService.get<string>(
    'GITHUB_CLIENT_SECRET',
  );

  @IsString({
    message: 'Set Env variable GITHUB_CLIENT, example: my_secret',
  })
  githubClient: string = this.configService.get<string>('GITHUB_CLIENT');
}
