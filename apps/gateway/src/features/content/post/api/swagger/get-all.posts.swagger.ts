import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PostOutputDto } from '../dto/output/post.output.dto';
import { BasePaginatedOutputDto } from '../../../../../base/dto/base-output-dto/base-paginated.output.dto';

export function GetAllPostsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all post',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: getSchemaPath(BasePaginatedOutputDto) },
              {
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(PostOutputDto) },
                  },
                },
              },
            ],
          },
          examples: {
            example1: {
              value: {
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
                totalCount: 100,
                pagesCount: 10,
                page: 1,
                pageSize: 10,
              },
            },
          },
        },
      },
    }),
  );
}
