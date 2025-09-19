import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для подтверждения регистрации
 *
 * Этот класс используется когда пользователь переходит по ссылке
 * из email для подтверждения своего аккаунта.
 */
export class RegistrationConfirmationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Код подтверждения, отправленный на email пользователя',
  })
  @IsString({ message: 'Код подтверждения должен быть строкой' })
  @IsUUID(4, { message: 'Некорректный формат кода подтверждения' })
  code: string;
}
