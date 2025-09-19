import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

/**
 * DTO для установки нового пароля
 *
 * Используется для подтверждения восстановления пароля
 * по коду из email
 */
export class NewPasswordDto {
  @ApiProperty({
    description: 'Новый пароль пользователя',
    example: 'newSecurePassword123',
    minLength: 6,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9_-]+$',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100, { message: 'Password too long' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Password can only contain letters, numbers, underscores and hyphens',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Код восстановления из email',
    example: 'uuid-recovery-code-here',
  })
  @IsString({ message: 'Recovery code must be a string' })
  recoveryCode: string;
}
