import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PostOutputDto } from '../../../features/posts/api/dto/output/post.output.dto';
import { APIErrorResult } from '../api-error/error-response.dto';
import { CreatePostDto } from '../../../features/posts/api/dto/input/createPost.dto';

export function SwaggerCreatePosts() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new post' }),
    ApiResponse({
      status: 201,
      description: 'Returns the newly created post',
      type: PostOutputDto,
    }),
    ApiResponse({
      status: 400,
      description: 'If the inputModel has incorrect values',
      type: APIErrorResult,
      content: {
        'application/json': {
          example: {
            statusCode: 400,
            message: 'Validation failed',
            errorsMessages: [],
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Multipart form data for post creation',
      required: true,
      type: CreatePostDto,
    }),
  );
}
