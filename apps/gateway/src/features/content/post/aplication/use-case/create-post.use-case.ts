import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { PhotoRepository } from '../../infrastructure/photo.repository';
import { Post } from '../../domain/post.aggregate';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Notification } from '../../../../../../base/notification/notification';

/*
	- upload photos in storage
	- create aggregate
	- save all aggregate (post with photos)
 */

export class CreatePostCommand {
  constructor(
    public readonly data: {
      photos: Express.Multer.File[];
      description: string | null;
      // fileUrls: string[];
      userId: number;
    },
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly photoRepository: PhotoRepository,
    private storageProxyClient: ClientProxy,
  ) {}

  async execute({ data }: CreatePostCommand) {
    const { photos, userId, description } = data;
    let post: Post;

    try {
      // upload photos in storage
      const uploadResult = await firstValueFrom(
        this.storageProxyClient.send('uploadFiles', {
          files: photos.map((f) => ({
            buffer: f.buffer,
            originalName: f.originalname,
            mimetype: f.mimetype,
          })),
          userId,
        }),
      );

      if (!uploadResult?.fileUrls?.length) {
        return Notification.internalError('File upload failed');
      }

      // create aggregate
      post = Post.create(description, userId);
      uploadResult.fileUrls.forEach((url) => post.addPhoto(url));

      // save all aggregate
      await this.postRepository.save(post);

      return Notification.success(post.getId());
    } catch (err) {
      if (post) {
        await this.postRepository.delete(post.getId());
        // Здесь можно добавить удаление файлов из хранилища
      }
      return Notification.error(error.message);
    }
  }
}
