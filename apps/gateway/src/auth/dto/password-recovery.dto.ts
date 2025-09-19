import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

/**
 * DTO для восстановления пароля
 * 
 * Используется когда пользователь забыл пароль и хочет
 * получить email с кодом восстановления
 */
export class PasswordRecoveryDto {
  @ApiProperty({
    description: 'Email зарегистрированного пользователя',
    example: 'user@example.com',
    pattern: '^[w-.]+@([w-]+.)+[w-]{2,4}$'
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'Google reCAPTCHA значение',
    example: 'recaptcha_token_here',
    maxLength: 100
  })
  @IsString({ message: 'Recaptcha value must be a string' })
  @MaxLength(100, { message: 'Recaptcha value too long' })
  recaptchaValue: string;
}
