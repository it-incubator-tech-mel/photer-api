

export type ReCaptchaResponse = {
    success: true|false;
    challenge_ts: string;
    hostname: string;
    'error-codes': any[]
}