import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostQueryRepository } from '../../infrastructure/posts.query.repository';
import { BaseQueryParams } from '../../../../../base/dto/base.query-param';

export class GetUserPostsQuery {
  constructor(
    public readonly id: number,
    public readonly baseQueryParams: BaseQueryParams,
    public readonly req: number | null,
  ) {}
}

@QueryHandler(GetUserPostsQuery)
export class GetUserPostsUseCase implements IQueryHandler<GetUserPostsQuery> {
  constructor(private postRepository: PostQueryRepository) {}
  async execute(query: GetUserPostsQuery) {
    const { id, baseQueryParams, req } = query;

    return await this.postRepository.findUserProfile(id, baseQueryParams, req);
  }
}
