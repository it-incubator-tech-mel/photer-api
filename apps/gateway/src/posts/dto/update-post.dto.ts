import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({
    description: 'New post description (0-500 characters)',
    example: 'Updated post content',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500, {
    message: 'Description cannot be longer than 500 characters',
  })
  description: string;
}
