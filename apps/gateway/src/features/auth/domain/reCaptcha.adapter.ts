import {Injectable} from "@nestjs/common";
import {ReCaptchaResponse} from "../api/dto/variable types/captcha-type";
import {CaptchaConfig} from "../../../core/config/captcha.config";

@Injectable()
export class ReCaptchaProvider {
    constructor(private captchaConfig: CaptchaConfig) {
    }
    async isValue(token): Promise<boolean>{
        const result = await fetch('https://www.google.com/recaptcha/api/siteverify',{
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            body: `secret=${this.captchaConfig.captchaSecret}&response=${token}`,
        })
        const response: ReCaptchaResponse = await result.json()
        return response.success
    }
}