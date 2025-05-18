import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostOutputDto } from '../dto/output/post.output.dto';

export function GetOnePostDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns post by id' }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: PostOutputDto,
      content: {
        'application/json': {
          example: {
            id: '123',
            description: 'description',
            photos: [
              'https://cdn.example.com/posts/sunset-1.jpg',
              'https://cdn.example.com/posts/sunset-2.jpg',
            ],
            userId: '12',
            status: true,
            createdAt: '2024-05-20T14:32:15.123Z',
            updatedAt: '2024-05-20T14:32:15.123Z',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
  );
}
