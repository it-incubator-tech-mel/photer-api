import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { Post } from '../../domain/post.entity';

export class CreatePostCommand {
  constructor(
    public readonly data: {
      photo: string[];
      userId: number;
      body: string | null;
    },
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private postRepository: PostRepository) {}
  async execute(command: CreatePostCommand) {
    const { photo, userId, body } = command.data;
    const post: Post = Post.create(body, photo, userId);
    return this.postRepository.createOnePost(post);
  }
}
