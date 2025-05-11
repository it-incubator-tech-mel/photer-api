import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export abstract class PaginatedViewDto<T> {
  @ApiProperty({
    description: 'Array of items',
    type: 'array',
    items: { $ref: 'T' },
  })
  @Type(() => Array<T>)
  abstract items: T;

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

  public static mapToView<T>(data: {
    items: T;
    page: number;
    size: number;
    totalCount: number;
  }): PaginatedViewDto<T> {
    return {
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.size),
      page: data.page,
      pageSize: data.size,
      items: data.items,
    };
  }
}
