import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { OutputPostType } from '../../api/dto/output/Output.post.type';
import { Post } from '../../domain/post.entity';

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
