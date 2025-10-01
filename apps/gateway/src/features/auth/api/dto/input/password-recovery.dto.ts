import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Trim } from '../../../../../core/decorators/trim';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordRecoveryDto {
  @ApiProperty({
    pattern: '^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
    example: 'user@example.com',
    description: 'Email of registered user',
  })
  @Trim()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    maxLength: 2000,
    description: 'Google reCAPTCHA value (token)',
    example: '03AGdBq27M...token',
  })
  @IsString()
  @Trim()
  @IsNotEmpty({ message: 'recaptchaValue is required' })
  @MaxLength(2000, {
    message: 'recaptchaValue must be at most 2000 characters',
  })
  recaptchaValue: string;
}
