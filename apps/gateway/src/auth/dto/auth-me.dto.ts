import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для информации о текущем пользователе
 *
 * Возвращает базовую информацию о пользователе
 * после успешной аутентификации
 */
export class AuthMeDto {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Email адрес пользователя',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Имя пользователя (username)',
    example: 'fara68',
  })
  username: string;
}
