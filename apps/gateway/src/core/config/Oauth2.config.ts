import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import { configValidation } from './config-validation';
import {IsString} from "class-validator";

@Injectable()
export class Oauth2Config {
    constructor(private configService: ConfigService<any, true>) {
        console.log('in Oauth2Config', configService);
        configValidation.validateConfig(this);
    }
    @IsString({
        message: 'Set Env variable CAPTCHA_SECRET, example: my_secret',
    })
    githubClientSecret: string = this.configService.get<string>('GITHUB_CLIENT_SECRET');

    @IsString({
        message: 'Set Env variable CAPTCHA_SECRET, example: my_secret',
    })
    githubClient: string = this.configService.get<string>('GITHUB_CLIENT');

    @IsString({
        message: 'Set Env variable CAPTCHA_SECRET, example: my_secret',
    })
    googleClientSecret: string = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    @IsString({
        message: 'Set Env variable CAPTCHA_SECRET, example: my_secret',
    })
    googleClient: string = this.configService.get<string>('GOOGLE_CLIENT');
}