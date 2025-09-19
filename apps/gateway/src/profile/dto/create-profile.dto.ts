import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    description: 'Username (must be unique)',
    example: 'alex-123',
    minLength: 6,
    maxLength: 30,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @IsString()
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message:
      'Username can only contain letters, numbers, hyphens and underscores',
  })
  username: string;

  @ApiProperty({
    description: 'First name',
    example: 'Alex',
    minLength: 1,
    maxLength: 50,
    pattern: '^[A-Za-zА-Яа-я]+$',
  })
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Za-zА-Яа-я]+$/, {
    message: 'First name can only contain letters',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Potter',
    minLength: 1,
    maxLength: 50,
    pattern: '^[A-Za-zА-Яа-я]+$',
  })
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Za-zА-Яа-я]+$/, {
    message: 'Last name can only contain letters',
  })
  lastName: string;

  @ApiProperty({
    description: 'Birth date in dd.mm.yyyy format',
    example: '31.12.2000',
    required: false,
  })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiProperty({
    description: 'Country from predefined list',
    example: 'United States',
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: 'City from predefined list',
    example: 'New York',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'About me (max 200 characters)',
    example: 'Hello! I am a software developer.',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  aboutMe?: string;
}
