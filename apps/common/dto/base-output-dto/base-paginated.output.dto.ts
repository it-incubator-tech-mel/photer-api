import { ApiProperty } from '@nestjs/swagger';

export class BasePaginatedOutputDto<T> {
  @ApiProperty({
    description: 'Array of items',
    type: 'array',
    items: {
      oneOf: [],
    },
  })
  items: T;

  @ApiProperty({
    example: 100,
    description: 'Total number of items',
  })
  totalCount: number;

  @ApiProperty({
    example: 10,
    description: 'Total number of pages',
  })
  pagesCount: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  pageSize: number;

  public static mapToOutput<T>(data: {
    items: T;
    page: number;
    size: number;
    totalCount: number;
  }): BasePaginatedOutputDto<T> {
    return {
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.size),
      page: data.page,
      pageSize: data.size,
      items: data.items,
    };
  }
}
