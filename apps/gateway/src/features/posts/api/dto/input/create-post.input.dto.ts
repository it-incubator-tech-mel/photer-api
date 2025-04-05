import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../../../core/decorators/trim';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'Description of the post', required: false })
  @IsOptional()
  @IsString()
  @Trim()
  @Length(0, 500, {
    message: 'Description must contain up to 500 characters.',
  })
  description?: string;

  @ApiProperty({
    description: 'Array of photo URLs',
    type: [String],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'The photo array must not be empty.' })
  @IsString({ each: true })
  photos: string[];
}
