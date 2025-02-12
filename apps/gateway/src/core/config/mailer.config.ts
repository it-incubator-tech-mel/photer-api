import { IsNumber, IsString } from 'class-validator';
import { configValidation } from '../../../../common/config/config-validation';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerConfig {
  constructor(private configService: ConfigService) {
    console.log('in MailerConfig', configService);
    configValidation.validateConfig(this);
  }

  @IsString({
    message: 'Set Env variable MAILER_HOST, example: smtp.example.com',
  })
  emailHost: string = this.configService.get<string>('EMAIL_HOST');

  @IsNumber({}, { message: 'Set Env variable MAILER_PORT, example: 587' })
  emailPort: number = Number(this.configService.get('EMAIL_PORT'));

  @IsString({
    message: 'Set Env variable MAILER_USER, example: user@example.com',
  })
  emailUser: string = this.configService.get<string>('EMAIL_USER');

  @IsString({
    message: 'Set Env variable MAILER_PASSWORD, example: secretpassword',
  })
  emailPassword: string = this.configService.get<string>('EMAIL_PASSWORD');
}
