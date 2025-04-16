import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { Post } from '../../domain/post.entity';
import { Photo } from '../../../photo/domain/photo.entity';
import { PhotoRepository } from '../../../photo/infrastructure/photo.repository';

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
  constructor(
    private postRepository: PostRepository,
    private photoRepository: PhotoRepository,
  ) {}
  async execute(command: CreatePostCommand) {
    const { photo, userId, body } = command.data;
    const post: Post = Post.create(body, userId);
    const newPost = await this.postRepository.createOnePost(post);
    for (const photoI of photo) {
      const createPhoto: Photo = Photo.create(
        photoI,
        newPost.id,
        newPost.createdAt,
      );
      await this.photoRepository.create(createPhoto);
    }
  }
}
