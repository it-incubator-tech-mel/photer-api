import { Type } from 'class-transformer';

export class BaseQueryParams {
  @Type(() => Number)
  pageNumber: number = 1;
  @Type(() => Number)
  pageSize: number = 8;
  sortDirection: SortDirection = SortDirection.Desc;
  sortBy: SortByEnum = SortByEnum.createdAt;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}
export enum SortByEnum {
  createdAt = 'createdAt',
  login = 'login',
  email = 'email',
}
