import { IsOptional, Length, Matches, Validate, IsIn } from 'class-validator';
import { MinAge } from '../../../../../core/decorators/custom/min-age.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  @ApiProperty({
    minLength: 6,
    maxLength: 30,
    pattern: '^[a-zA-Z0-9_-]*$',
    description: 'Must be unique',
    example: 'alex-123',
  })
  @Length(6, 30, { message: 'Username must be between 6 and 30 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores, and hyphens',
  })
  username: string;

  @ApiProperty({
    minLength: 1,
    maxLength: 50,
    pattern: '^[A-Za-zА-Яа-я]+$',
    example: 'Alex',
  })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  @Matches(/^[A-Za-zА-Яа-я]+$/, {
    message: 'First name must contain only Latin or Cyrillic letters',
  })
  firstName: string;

  @ApiProperty({
    minLength: 1,
    maxLength: 50,
    pattern: '^[A-Za-zА-Яа-я]+$',
    example: 'Potter',
  })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  @Matches(/^[A-Za-zА-Яа-я]+$/, {
    message: 'Last name must contain only Latin or Cyrillic letters',
  })
  lastName: string;

  @ApiProperty({
    description: 'Date in dd.mm.yyyy format',
    required: false,
    example: '31.12.2000',
  })
  @IsOptional()
  @Matches(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.\d{4}$/, {
    message: 'Invalid date format. Use dd.mm.yyyy',
  })
  @Validate(MinAge, [13], {
    message: 'A user under 13 cannot create a profile',
  })
  birthDate?: string;

  @ApiProperty({
    description: 'Country from predefined list',
    required: false,
    example: 'United States',
  })
  @IsOptional()
  // @IsIn(['United States', 'Canada', 'Germany'], {
  //   message: 'Invalid country selection',
  // })
  country?: string;

  @ApiProperty({
    description: 'City from predefined list',
    required: false,
    example: 'New York',
  })
  @IsOptional()
  // @IsIn(['New York', 'Berlin', 'Toronto'], {
  //   message: 'Invalid city selection',
  // })
  city?: string;

  @ApiProperty({
    description: 'About me (max 200 characters)',
    required: false,
    example: 'Hello! I am a software developer.',
  })
  @IsOptional()
  @Length(0, 200, { message: 'About me must be less than 200 characters' })
  @Matches(/^[\w\sА-Яа-яЁё!@#$%^&*(),.?":{}|<>+=\[\]\\/;'№~-]*$/u, {
    message: 'Contains invalid characters',
  })
  aboutMe?: string;
}
