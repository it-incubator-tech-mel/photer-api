import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { PhotoRepository } from '../../infrastructure/photo.repository';
import { Post } from '../../domain/post.entity';
import { Photo } from '../../domain/photo.entity';
import { PostQueryRepository } from '../../infrastructure/posts.query.repository';

export class CreatePostCommand {
  constructor(
    public readonly data: {
      fileUrls: string[];
      userId: number;
      description: string | null;
    },
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postQueryRepository: PostQueryRepository,
    private readonly photoRepository: PhotoRepository,
  ) {}

  async execute({ data }: CreatePostCommand) {
    const { fileUrls, userId, description } = data;

    try {
      const post: Post = Post.create(description, userId);
      const savedPost: Post = await this.postRepository.create(post);

      await Promise.all(
        fileUrls.map((url) => {
          const photo: Photo = Photo.create(
            url,
            savedPost.getId(),
            savedPost.getCreatedAt(),
          );
          return this.photoRepository.create(photo);
        }),
      );

      return this.postQueryRepository.getOne(savedPost.getId());
    } catch (err) {
      throw new Error('Error creating post');
    }
  }
}
