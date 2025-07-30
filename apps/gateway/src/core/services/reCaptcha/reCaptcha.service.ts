import { Injectable } from '@nestjs/common';
import { CaptchaConfig } from '../../config/captcha.config';

@Injectable()
export class ReCaptchaService {
  constructor(private captchaConfig: CaptchaConfig) {}

  async isValue(token: string): Promise<boolean> {
    const result: Response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        body: new URLSearchParams({
          secret: this.captchaConfig.captchaSecret,
          response: token,
        }),
      },
    );

    const response: ReCaptchaResponse = await result.json();

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
