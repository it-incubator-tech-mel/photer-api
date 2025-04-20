import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { Post } from '../../domain/post.entity';

export class GetMyProfileCommand {
  constructor(public readonly id: number) {}
}

@CommandHandler(GetMyProfileCommand)
export class GetMyProfileUseCase
  implements ICommandHandler<GetMyProfileCommand>
{
  constructor(private readonly postRepository: PostRepository) {}
  async execute(command: GetMyProfileCommand) {
    const postOnProfile = await this.postRepository.findProfileUser(command.id);
    return postOnProfile.map((post) => Post.getViewModel(post));
  }
}
