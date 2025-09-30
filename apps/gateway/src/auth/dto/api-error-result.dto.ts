import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для описания ошибки в конкретном поле
 *
 * Используется для детального описания ошибок валидации
 * и других проблем с данными.
 */
export class FieldError {
  @ApiProperty({
    example: 'User with such credentials already exists',
    description: 'Сообщение с объяснением ошибки для конкретного поля',
  })
  message: string;

  @ApiProperty({
    example: 'email',
    description: 'Название поля, в котором произошла ошибка',
  })
  field: string;
}

/**
 * DTO для результата с ошибками API
 *
 * Этот класс используется когда API возвращает ошибку 400
 * с детальным описанием проблем в данных.
 */
export class ApiErrorResult {
  @ApiProperty({
    type: [FieldError],
    description: 'Массив ошибок для различных полей',
  })
  errorsMessages: FieldError[];
}
