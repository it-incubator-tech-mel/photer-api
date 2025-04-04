import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { OutputPostType } from '@posts/api/dto/output/Output.post.type';
import { PostSchema } from '../../../../../mongo.schemas/postSchemaModel';
import { Post } from '@posts/domain/post.entity';

export class GetAllPostsCommand {
  constructor() {}
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(private postRepository: PostRepository) {}
  async execute(): Promise<OutputPostType[]> {
    const allPosts: PostSchema[] = await this.postRepository.findAllPosts();
    return allPosts.map((post) => Post.getViewModel(post));
  }
  //TODO: надо сделать крон
}
