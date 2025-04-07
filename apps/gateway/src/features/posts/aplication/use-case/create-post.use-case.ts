import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Post } from '@posts/domain/post.entity';
import { PostRepository } from '@posts/infrastructure/post.repository';

export class CreatePostCommand {
  constructor(
    public readonly data: {
      photoLink: string[];
      userId: number;
      description: string | null;
    },
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private postRepository: PostRepository) {}
  async execute(command: CreatePostCommand) {
    const { photoLink, userId, description } = command.data;
    const post: Post = Post.create(description, photoLink, userId);
    return this.postRepository.createOnePost(post);
  }
}
