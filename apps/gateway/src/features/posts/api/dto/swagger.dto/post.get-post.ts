import { ApiProperty } from '@nestjs/swagger';

export class PostGetPost {
  @ApiProperty({ description: 'ID of the post' })
  id: string;
  @ApiProperty({ description: 'Description of the post' })
  description: string;
  @ApiProperty({ description: 'Array of photo URLs', type: [String] })
  photo: string[];
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
