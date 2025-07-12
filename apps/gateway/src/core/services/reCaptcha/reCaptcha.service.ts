import { Injectable } from '@nestjs/common';
import { CaptchaConfig } from '../../config/captcha.config';

@Injectable()
export class ReCaptchaService {
  constructor(private captchaConfig: CaptchaConfig) {}

  async isValue(token: string): Promise<boolean> {
    console.log('isValue token', token);
    console.log(
      'isValue this.captchaConfig.captchaSecret',
      this.captchaConfig.captchaSecret,
    );

    const result: Response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        headers: {
          'Content-Type': 'aplication/x-www-form-urlencoded',
        },
        method: 'POST',
        body: `secret=${this.captchaConfig.captchaSecret}&response=${token}`,
      },
    );

    const response: ReCaptchaResponse = await result.json();

    console.log('isValue response result', response);

    if (!response.success) return false;

    return response.score >= 0.7;
  }
}

export type ReCaptchaResponse = {
  success: true | false;
  challenge_ts: string;
  hostname: string;
  'error-codes': any[];
  score: number;
};
