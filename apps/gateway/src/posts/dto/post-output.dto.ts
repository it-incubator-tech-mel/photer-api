import { ApiProperty } from '@nestjs/swagger';

export class PostOwnerOutputDto {
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
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'Last name of the post owner',
    example: 'Ivanov',
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'Array of profile photo URLs',
    example: 'https://storage.example.com/1/avatar1.jpg',
    nullable: true,
  })
  avatarUrl: string | null;
}

export class PostOutputDto {
  @ApiProperty({
    description: 'Id of the post',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'Description of the post',
    example: 'This is my first post',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Array of post tags',
    example: ['nature', 'photography', 'sunset'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Array of photo URLs',
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
    type: [String],
  })
  photos: string[];

  @ApiProperty({
    description: 'Owner of the post',
    type: PostOwnerOutputDto,
  })
  owner: PostOwnerOutputDto;

  @ApiProperty({
    description: 'Post status: true = public, false = private',
    example: true,
    enum: [true, false],
  })
  status: boolean;

  @ApiProperty({
    description: 'Creation date of the post',
    example: '2025-04-02T08:29:22.243Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update date of the post',
    example: '2025-04-02T08:29:22.243Z',
  })
  updatedAt: string;
}
