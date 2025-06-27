import { ApiProperty } from '@nestjs/swagger';

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
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Ivanov',
  })
  lastName: string;

  @ApiProperty({
    description: 'User city of residence',
    example: 'Moscow',
    required: false,
  })
  city?: string;

  @ApiProperty({
    description: 'User country of residence',
    example: 'Russia',
    required: false,
  })
  country?: string;

  // @ApiProperty({
  //   description: 'User region (state/province)',
  //   example: 'Moscow Oblast',
  //   required: false,
  // })
  // region?: string;

  @ApiProperty({
    description: 'User date of birth',
    type: String,
    example: '1990-05-15',
    required: false,
  })
  birthDate?: string;

  @ApiProperty({
    description: 'Brief information about the user',
    example: 'Software developer',
    required: false,
  })
  aboutMe?: string;

  @ApiProperty({
    description: 'Array of profile photo URLs',
    type: [String],
    example: [
      'https://storage.example.com/1/avatar1.jpg',
      // 'https://storage.example.com/profiles/1/avatar_hiking.jpg',
    ],
    required: false,
  })
  avatarUrl: string[];

  @ApiProperty({
    description: 'Profile creation timestamp',
    type: String,
    example: '2025-04-02T08:29:22.243Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Profile last update timestamp',
    type: String,
    example: '2025-05-15T14:30:10.521Z',
  })
  updatedAt: string;
}
