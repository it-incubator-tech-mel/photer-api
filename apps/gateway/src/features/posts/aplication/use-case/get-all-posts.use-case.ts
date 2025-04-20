/*
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { PostOutputDto } from '../../api/dto/output/post.output.dto';
import { Post } from '../../domain/post.entity';

export class GetAllPostsCommand {
  constructor() {}
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(private postRepository: PostRepository) {}
  async execute(): Promise<PostOutputDto[]> {
    const allPosts: Post[] = await this.postRepository.findAllPosts();
    return allPosts.map((post) => Post.getViewModel(post));
  }
}
*/
