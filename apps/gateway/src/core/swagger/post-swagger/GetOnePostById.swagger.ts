import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostOutputDto } from '../../../features/posts/api/dto/output/post.output.dto';

export function SwaggerGetPostsById() {
  return applyDecorators(
    ApiOperation({ summary: 'Returns post by id' }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: PostOutputDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
  );
}
