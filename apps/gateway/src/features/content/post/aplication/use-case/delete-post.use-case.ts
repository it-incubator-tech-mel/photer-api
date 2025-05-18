import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { PhotoRepository } from '../../infrastructure/photo.repository';
import { Notification } from '../../../../../../base/notification/notification';
import { Post } from '../../domain/post.aggregate';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

export class DeletePostCommand {
  constructor(
    public readonly payload: {
      postId: number;
      userId: number;
    },
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly photoRepository: PhotoRepository,
    private readonly storageProxyClient: ClientProxy,
  ) {}

  async execute({ payload }: DeletePostCommand): Promise<Notification> {
    const { postId, userId } = payload;

    const post: Post = await this.postRepository.findById(postId);
    if (!post) {
      return Notification.notFound('Post not found');
    }

    if (post.getId() !== userId) {
      return Notification.forbidden('Not post owner');
    }

    try {
      const photoUrls: string[] =
        post.getPhotos().map((p) => p.getPhotoUrl()) || [];

      const deleteFilesPattern = { cmd: 'deleteFiles' };
      const deleteResult = await firstValueFrom(
        this.storageProxyClient.send(deleteFilesPattern, {
          fileUrls: photoUrls,
          userId,
        }),
      );

      // [Nest] 11852  - 04/24/2025, 5:47:01 PM   ERROR [ExceptionsHandler] Object(2) {
      //   status: 'error',
      //     message: 'Internal server error'
      // }

      if (deleteResult.deletedLength !== photoUrls.length) {
        return Notification.forbidden('Partial files deletion');
      }

      // delete the post from db
      const deletePostResult: Post =
        await this.postRepository.softDelete(postId);
      // await this.photoRepository.softDeleteByPostId(postId);
      // await this.postRepository.softDelete(postId, userId);
      if (!deletePostResult) {
        return Notification.forbidden('Partial files deletion');
      }
    } catch (e) {
      console.error('Storage microservice communication error:', e);
      return Notification.internalError('Storage service unavailable');
    }

    // const post: Post = await this.postRepository.findByIdAndUserId(
    //   postId,
    //   userId,
    // );
    //
    // if (!post) {
    //   return Notification.forbidden("Post doesn't belongs to current user");
    // }
    //
    // await this.photoRepository.softDeleteByPostId(postId);
    // await this.postRepository.softDelete(postId, userId);
    //
    // return Notification.success();
  }
}
