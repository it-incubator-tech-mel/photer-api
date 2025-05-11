import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostGetPost } from '../../../features/posts/api/dto/swagger.dto/post.get-post';

export function SwaggerGetPosts() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all posts',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: [PostGetPost],
      content: {
        'application/json': {
          example: {
            statusCode: 200,
          },
        },
      },
    }),
  );
}
