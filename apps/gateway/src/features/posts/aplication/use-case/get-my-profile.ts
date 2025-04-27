import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostQueryRepository } from '../../infrastructure/posts.query.repository';
import { PostOutputDto } from '../../api/dto/output/post.output.dto';

export class GetMyProfileCommand {
  constructor(public readonly id: number) {}
}

@CommandHandler(GetMyProfileCommand)
export class GetMyProfileUseCase
  implements ICommandHandler<GetMyProfileCommand>
{
  constructor(private readonly postRepository: PostQueryRepository) {}
  async execute(command: GetMyProfileCommand): Promise<PostOutputDto[]> {
    return this.postRepository.findUserProfile(command.id);
  }
}
