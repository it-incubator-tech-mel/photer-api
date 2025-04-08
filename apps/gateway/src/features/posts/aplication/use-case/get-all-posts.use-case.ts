import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OutputPostType } from '@posts/api/dto/output/Output.post.type';
import { Post } from '@posts/domain/post.entity';
import { PostRepository } from '@posts/infrastructure/post.repository';

export class GetAllPostsCommand {
  constructor() {}
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(private postRepository: PostRepository) {}
  async execute(): Promise<OutputPostType[]> {
    const allPosts: Post[] = await this.postRepository.findAllPosts();
    return allPosts.map((post) => Post.getViewModel(post));
  }
}
