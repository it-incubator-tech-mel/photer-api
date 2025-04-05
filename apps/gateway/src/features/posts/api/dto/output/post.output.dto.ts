import { ApiProperty } from '@nestjs/swagger';

export class PostOutputDto {
  @ApiProperty({ description: 'Id of the post' })
  id: string;

  @ApiProperty({ description: 'Description of the post', required: false })
  description?: string;

  @ApiProperty({ description: 'Array of photo URLs', type: [String] })
  photos: string[];

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
