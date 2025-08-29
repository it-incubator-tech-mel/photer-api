import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { PostOutputDto } from '../dto/output/post.output.dto';
import { BasePaginatedOutputDto } from '../../../../../../../common/dto/base-output-dto/base-paginated.output.dto';

export function GetAllUserPostsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all user post',
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
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
  );
}
