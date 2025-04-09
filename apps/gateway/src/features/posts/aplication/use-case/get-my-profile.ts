import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';

export class GetMyProfileCommand {
  constructor(public readonly id: number) {}
}

@CommandHandler(GetMyProfileCommand)
export class GetMyProfileUseCase
  implements ICommandHandler<GetMyProfileCommand>
{
  constructor(private readonly postRepository: PostRepository) {}
  async execute(command: GetMyProfileCommand) {
    return this.postRepository.findProfileUser(command.id);
  }
}
