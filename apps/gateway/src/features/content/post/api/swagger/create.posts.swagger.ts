import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PostOutputDto } from '../dto/output/post.output.dto';
import { CreatePostDto } from '../dto/input/create-post.input.dto';
import { APIErrorResult } from '../../../../../core/swagger/api-error/error-response.dto';

export function CreatePostDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new post' }),
    ApiResponse({
      status: 201,
      description: 'Returns the newly created post',
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
