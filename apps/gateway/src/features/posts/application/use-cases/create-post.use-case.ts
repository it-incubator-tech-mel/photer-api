import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { Post } from '../domain/post.entity';

export class CreatePostCommand {
  constructor(
    public readonly data: {
      urls: string[];
      userId: number;
      description?: string;
    },
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(private postRepository: PostRepository) {}
  async execute(command: CreatePostCommand) {
    const { urls, userId, description } = command.data;
    console.log('urls', urls);
    console.log('userId', userId);
    console.log('description', description);
    const post: Post = Post.create(urls, description, userId);
    console.log('post', post);
    return this.postRepository.create(post);
  }
}
