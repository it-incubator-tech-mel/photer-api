import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для повторной отправки email подтверждения
 *
 * Используется когда пользователь не получил email или
 * код подтверждения истек.
 */
export class RegistrationEmailResendingDto {
  @ApiProperty({
    example: 'user@example.com',
    description:
      'Email адрес зарегистрированного, но не подтвержденного пользователя',
  })
  @IsEmail({}, { message: 'Некорректный формат email адреса' })
  email: string;
}
