import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export const BaseSortBy = {
  CREATED_AT: 'createdAt',
} as const;

export type SortBy = (typeof BaseSortBy)[keyof typeof BaseSortBy]; // 'createdAt'

export class BaseQueryParams<TSortBy extends string = SortBy> {
  @ApiProperty({
    type: Number,
    example: 1,
    default: 1,
    description: 'Page number',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  pageNumber: number = 1;

  @ApiProperty({
    type: Number,
    example: 8,
    default: 8,
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize: number = 8;

  @ApiProperty({
    enum: SortDirection,
    example: SortDirection.DESC,
    default: SortDirection.DESC,
    description: 'Sorting direction',
    required: false,
  })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.DESC;

  @ApiProperty({
    description: 'The sorting field',
    default: BaseSortBy.CREATED_AT,
    enum: [BaseSortBy.CREATED_AT],
    required: false,
  })
  @IsOptional()
  sortBy: TSortBy = BaseSortBy.CREATED_AT as TSortBy;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
