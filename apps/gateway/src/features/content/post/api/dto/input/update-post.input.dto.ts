import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/trim';

export class UpdatePostDto {
  @ApiProperty({
    description: 'New post description (0-500 characters)',
    example: 'Updated post content',
    required: true,
  })
  @IsString({ message: 'Description must be a string' })
  @Trim()
  @Length(0, 500, {
    message: 'Description must be between 0 and 500 characters',
  })
  description: string;
}
