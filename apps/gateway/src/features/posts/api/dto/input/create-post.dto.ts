import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../../../core/decorators/trim';
import { IsString, Length } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'description for the post, no mandatory',
  })
  @IsString()
  @Trim()
  @Length(null, 500, {
    message: 'The description must contain up to 500 characters.',
  })
  description: string | null;
}
