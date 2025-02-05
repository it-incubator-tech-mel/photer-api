import { ConfigService } from '@nestjs/config';
import { configValidation } from '../../../common/config/config-validation';
import { IsString } from 'class-validator';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseConfig {
  constructor(private configService: ConfigService<any, true>) {
    configValidation.validateConfig(this);
  }

  @IsString({
    message: 'Set Env variable GW_DB_URL.'
  })
  GW_DB_URL: string = this.configService.get('GW_DB_URL');

  getDatabaseUrl(): string {
    return this.GW_DB_URL;
  }
}