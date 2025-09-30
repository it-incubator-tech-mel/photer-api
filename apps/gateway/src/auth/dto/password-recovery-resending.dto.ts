import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/**
 * DTO для повторной отправки восстановления пароля
 * 
 * Используется когда пользователь не получил email
 * с кодом восстановления
 */
export class PasswordRecoveryResendingDto {
  @ApiProperty({
    description: 'Email зарегистрированного пользователя',
    example: 'user@example.com',
    pattern: '^[w-.]+@([w-]+.)+[w-]{2,4}$'
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
