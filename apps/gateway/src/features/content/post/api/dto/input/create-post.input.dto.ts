import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { Trim } from '../../../../../../core/decorators/trim';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post description (optional)',
    required: false,
    maxLength: 500,
    example: 'My awesome post content',
  })
  @IsOptional()
  @IsString()
  @Trim()
  @Length(0, 500, {
    message: 'Description must contain up to 500 characters.',
  })
  description?: string = undefined;
}
