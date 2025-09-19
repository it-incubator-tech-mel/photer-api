import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для регистрации пользователя
 *
 * Этот класс определяет структуру данных, которые должны прийти
 * при регистрации пользователя. Включает валидацию полей и
 * документацию для Swagger.
 */
export class RegistrationDto {
  @ApiProperty({
    example: 'bW6UL1DI-qSRJXOOXOty8O_EphT8NI',
    description:
      'Уникальное имя пользователя (6-30 символов, только буквы, цифры, подчеркивания и дефисы)',
    minLength: 6,
    maxLength: 30,
  })
  @IsString({ message: 'Username должен быть строкой' })
  @MinLength(6, { message: 'Username должен содержать минимум 6 символов' })
  @MaxLength(30, { message: 'Username не может быть длиннее 30 символов' })
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message:
      'Username может содержать только буквы, цифры, подчеркивания (_) и дефисы (-)',
  })
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email адрес пользователя (должен быть уникальным)',
  })
  @IsEmail({}, { message: 'Некорректный формат email адреса' })
  email: string;

  @ApiProperty({
    example: 'string',
    description: 'Пароль пользователя (6-20 символов)',
    minLength: 6,
    maxLength: 20,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(20, { message: 'Пароль не может быть длиннее 20 символов' })
  password: string;
}
