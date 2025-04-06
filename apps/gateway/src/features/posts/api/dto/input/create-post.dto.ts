import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '../../../../../core/decorators/trim';
import { IsString, Length } from 'class-validator';
import { Express } from 'express';

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
  // @ApiProperty({
  //   description: 'Array of JPG images',
  //   type: 'string',
  //   format: 'binary',
  // })
  // photo: Express.Multer.File[];
}
