import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostOutputDto } from '../dto/output/post.output.dto';
import { PaginatedViewDto } from '../../../../../base/dto/base.paginated.view-dto';

export function GetAllPostsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all posts',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: PaginatedViewDto<PostOutputDto>,
      content: {
        'application/json': {
          example: {
            items: [
              {
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
            ],
            page: 1,
            size: 10,
            totalCount: 100,
            pagesCount: 10,
          },
        },
      },
    }),
  );
}
