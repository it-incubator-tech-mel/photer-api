import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsArray } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post description (optional)',
    example: 'My awesome post content',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Description cannot be longer than 500 characters',
  })
  description?: string;

  @ApiProperty({
    description: 'Post tags (optional)',
    example: ['nature', 'photography', 'sunset'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
