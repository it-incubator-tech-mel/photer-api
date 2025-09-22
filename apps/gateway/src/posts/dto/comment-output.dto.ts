import { ApiProperty } from '@nestjs/swagger';

export class CommentOwnerDto {
  @ApiProperty({
    description: 'Username of the comment author',
    example: 'john_doe',
  })
  userName: string;

  @ApiProperty({
    description: 'Avatar URL of the comment author',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatarUrl: string | null;
}

export class CommentOutputDto {
  @ApiProperty({
    description: 'Unique identifier of the comment',
    example: 'cmfovo66m0000v39816a2gwg8',
  })
  id: string;

  @ApiProperty({
    description: 'Text content of the comment',
    example: 'This is a great post!',
  })
  text: string;

  @ApiProperty({
    description: 'Creation timestamp in ISO format',
    example: '2025-09-21T16:54:45.196Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Information about the comment author',
    type: CommentOwnerDto,
  })
  owner: CommentOwnerDto;
}
