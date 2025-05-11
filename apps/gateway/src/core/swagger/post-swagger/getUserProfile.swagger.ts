import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostGetPost } from '../../../features/posts/api/dto/swagger.dto/post.get-post';

export function SwaggerGetUserProfile() {
  return applyDecorators(
    ApiOperation({
      summary:
        'returns profile - (unauthorized user has access to only 8 posts)',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: [PostGetPost],
      content: {
        'application/json': {
          example: {
            statusCode: 201,
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
