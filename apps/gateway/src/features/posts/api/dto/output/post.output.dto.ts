import { ApiProperty } from '@nestjs/swagger';

export class PostOutputDto {
  @ApiProperty({ description: 'Id of the post', example: '1' })
  id: string;

  @ApiProperty({
    description: 'Description of the post',
    example: 'This is my first post',
  })
  description: string;

  @ApiProperty({
    description: 'Array of photo URLs',
    type: [String],
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
  })
  photos: string[];

  // @ApiProperty({
  //   description: 'ID of the user who created the post',
  //   example: 42,
  // })
  // userId: number;

  // @ApiProperty({
  //   description: 'Name of the user who created the post',
  //   example: 'john_doe',
  // })
  // userName: string;

  @ApiProperty({
    description: 'Post status: true = public, false = private',
    type: Boolean,
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: 'Creation date of the post',
    type: String,
    example: '2025-04-02T08:29:22.243Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update date of the post',
    type: String,
    example: '2025-04-02T08:29:22.243Z',
  })
  updatedAt: string;
}
