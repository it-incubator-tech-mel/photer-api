import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../../../core/decorators/trim';
import { ArrayNotEmpty, IsArray, IsString, Length } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'description for the post, no mandatory',
  })
  @IsString()
  @Trim()
  @Length(0, 500, {
    message: 'The description must contain up to 500 characters.',
  })
  description: string;
  @ApiProperty({
    description: 'Array of photo URLs',
    type: [String],
    required: true,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'The photo array must not be empty.' })
  @IsString({ each: true })
  photo: string[];
}
