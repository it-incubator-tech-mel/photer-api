import { IsEmail, IsNotEmpty } from 'class-validator';
import { Trim } from '../../../../../core/decorators/trim';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationEmailResendingDto {
  @ApiProperty({
    pattern: '^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
    example: 'user@example.com',
    description: 'Email of already registered but not confirmed user',
  })
  @Trim()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}
