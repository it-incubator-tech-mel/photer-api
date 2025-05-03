import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostQueryRepository } from '../../infrastructure/posts.query.repository';
import { BaseQueryParams } from '../../../../../base/dto/base.query-param';

export class GetUserPostCommand {
  constructor(
    public readonly id: number,
    public readonly query: BaseQueryParams,
    public readonly req: number | null,
  ) {}
}

@CommandHandler(GetUserPostCommand)
export class GetUserPostsUseCase
  implements ICommandHandler<GetUserPostCommand>
{
  constructor(private postRepository: PostQueryRepository) {}
  async execute(command: GetUserPostCommand) {
    const { id, query, req } = command;
    const foundPosts = await this.postRepository.findUserProfile(
      id,
      query,
      req,
    );
    // console.log(foundPosts, '=------foundPosts');
    return foundPosts;
  }
}
