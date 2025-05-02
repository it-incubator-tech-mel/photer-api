import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';
import { isNumber } from 'class-validator';

export class PostGetPost {
  @ApiProperty({ description: 'ID of the post' })
  id: string;
  @ApiProperty({ description: 'Description of the post' })
  description: string;
  @ApiProperty({
    description: 'Array of photo URLs',
    //example: [
    //{
    //id: isNumber,
    //photoUrl:
    //'https://storage.yandexcloud.net/inctagram-photer/posts/1/2025-04-15/1744732239108-317.png',
    //createdAt: Date,
    //},
    //],
  })
  photo: Express.Multer.File[];
  @ApiProperty({ description: 'User ID of the post creator' })
  userId: string;
  @ApiProperty({
    description: 'Creation date of the post',
    type: String,
    example: '2025-04-02T08:29:22.243Z',
  })
  createdAt: '2025-04-02T08:29:22.243Z';
  @ApiProperty({
    description: 'Last update date of the post',
    type: String,
    example: '2025-04-02T08:29:22.243Z',
  })
  updatedAt: '2025-04-02T08:29:22.243Z';
}
