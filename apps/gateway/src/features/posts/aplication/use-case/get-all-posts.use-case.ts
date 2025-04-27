import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { OutputPostType } from '../../api/dto/output/Output.post.type';
import { Post } from '../../domain/post.entity';
import { BaseQueryParams } from '../../../../../base/dto/base.query-param';
import { PaginatedViewDto } from '../../../../../base/dto/base.paginated.view-dto';

export class GetAllPostsCommand {
  constructor(public readonly query: BaseQueryParams) {}
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(private postRepository: PostRepository) {}
  async execute(
    command: GetAllPostsCommand,
  ): Promise<PaginatedViewDto<OutputPostType[] | null>> {
    return this.postRepository.findAllPosts(command.query);
  }
}
