import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для вывода данных профиля пользователя
 *
 * Определяет структуру данных профиля, возвращаемых API.
 * Соответствует продакшн API ProfileOutputDto.
 */
export class ProfileOutputDto {
  @ApiProperty({
    description: 'Unique identifier of the profile',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'User name (unique identifier)',
    example: 'alexander_89',
  })
  username: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Alexander',
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Ivanov',
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'User city of residence',
    example: 'Moscow',
    nullable: true,
  })
  city: string | null;

  @ApiProperty({
    description: 'User country of residence',
    example: 'Russia',
    nullable: true,
  })
  country: string | null;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-05-15',
    nullable: true,
  })
  birthDate: string | null;

  @ApiProperty({
    description: 'Brief information about the user',
    example: 'Software developer',
    nullable: true,
  })
  aboutMe: string | null;

  @ApiProperty({
    description: 'Array of profile photo URLs',
    example: ['https://storage.example.com/1/avatar1.jpg'],
    type: [String],
  })
  avatarUrl: string[];

  @ApiProperty({
    description: 'Profile creation timestamp',
    example: '2025-04-02T08:29:22.243Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Profile last update timestamp',
    example: '2025-05-15T14:30:10.521Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Number of users this profile is following',
    example: 150,
  })
  following: number;

  @ApiProperty({
    description: 'Number of followers this profile has',
    example: 320,
  })
  followers: number;

  @ApiProperty({
    description: 'Number of publications (photos) this profile has',
    example: 42,
  })
  publications: number;
}
