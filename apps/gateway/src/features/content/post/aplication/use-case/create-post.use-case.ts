import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { Post } from '../../domain/post.aggregate';
import { Notification } from '../../../../../../base/notification/notification';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';

/*
	- upload photos in storage
	- create aggregate
	- save all aggregate (post with photos)
 */

export class CreatePostCommand {
  constructor(
    public readonly data: {
      photos: Express.Multer.File[];
      description?: string;
      userId: number;
    },
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject('STORAGE_POST_SERVICE')
    private storageProxyClient: ClientProxy,
    private readonly postRepository: PostRepository,
  ) {}

  async execute({
    data,
  }: CreatePostCommand): Promise<Notification<number | null>> {
    const { photos, userId, description } = data;

    let post: Post;

    try {
      const pattern = { cmd: 'uploadFiles' };
      const uploadResult: { fileUrls: [string]; userId: number } =
        await firstValueFrom(
          this.storageProxyClient.send(pattern, {
            files: photos.map((f) => ({
              buffer: f.buffer,
              originalName: f.originalname,
              mimetype: f.mimetype,
            })),
            userId,
          }),
        );

      if (
        !uploadResult?.fileUrls ||
        (uploadResult.fileUrls as string[]).length === 0
      ) {
        Notification.internalError('No file URLs received');
      }

      post = Post.create(userId, description);

      uploadResult.fileUrls.forEach((url) => post.addPhoto(url));

      const savedPost: Post = await this.postRepository.save(post);

      return Notification.success(savedPost.getId());
    } catch (err) {
      if (post) {
        await this.postRepository.softDelete(post.getId());
        // May add logic to delete files from storage
      }

      return Notification.internalError(err.message);
    }
  }
}
