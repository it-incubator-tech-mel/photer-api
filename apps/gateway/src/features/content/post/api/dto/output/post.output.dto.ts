import { ApiProperty } from '@nestjs/swagger';

class PostOwnerOutputDto {
  @ApiProperty({
    description: 'ID of the user who created the post',
    example: '1',
  })
  userId: string;

  @ApiProperty({
    description: 'Username of the post owner',
    example: 'alex123',
  })
  userName: string;

  @ApiProperty({
    description: 'First name of the post owner',
    example: 'Alexander',
    required: false,
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'Last name of the post owner',
    example: 'Ivanov',
    required: false,
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'Array of profile photo URLs',
    example: 'https://storage.example.com/1/avatar1.jpg',
    required: false,
    nullable: true,
  })
  avatarUrl: string | null;
}

export class PostOutputDto {
  @ApiProperty({ description: 'Id of the post', example: '1' })
  id: string;

  @ApiProperty({
    description: 'Description of the post',
    example: 'This is my first post',
    required: false,
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Array of photo URLs',
    type: [String],
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
  })
  photos: string[];

  @ApiProperty({
    description: 'Owner of the post',
    type: () => PostOwnerOutputDto,
  })
  owner: PostOwnerOutputDto;

  @ApiProperty({
    description: 'Post status: true = public, false = private',
    enum: [true, false],
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
