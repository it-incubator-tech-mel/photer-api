import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostQueryRepository } from '../../infrastructure/posts.query.repository';
import { PostOutputDto } from '../../api/dto/output/post.output.dto';
import { BaseQueryParams } from '../../../../../base/dto/base.query-param';
import { PaginatedViewDto } from '../../../../../base/dto/base.paginated.view-dto';

export class GetMyProfileCommand {
  constructor(
    public readonly id: number,
    public readonly query: BaseQueryParams,
  ) {}
}

@CommandHandler(GetMyProfileCommand)
export class GetMyProfileUseCase
  implements ICommandHandler<GetMyProfileCommand>
{
  constructor(private readonly postRepository: PostQueryRepository) {}
  async execute(
    command: GetMyProfileCommand,
  ): Promise<PaginatedViewDto<PostOutputDto[] | null>> {
    const { id, query } = command;
    return this.postRepository.findUserProfile(id, query);
  }
}
