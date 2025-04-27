import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BaseQueryParams } from '../../../../../base/dto/base.query-param';
import { PaginatedViewDto } from '../../../../../base/dto/base.paginated.view-dto';
import { PostOutputDto } from '../../api/dto/output/post.output.dto';
import { PostQueryRepository } from '../../infrastructure/posts.query.repository';

export class GetAllPostsCommand {
  constructor(public readonly query: BaseQueryParams) {}
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(private postRepository: PostQueryRepository) {}
  async execute(
    command: GetAllPostsCommand,
  ): Promise<PaginatedViewDto<PostOutputDto[] | null>> {
    return this.postRepository.findAllPosts(command.query);
  }
}
