import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { Notification } from '../../../../../../base/notification/notification';
import { Post } from '../../domain/post.aggregate';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

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
    @Inject('STORAGE_POST_SERVICE')
    private storageProxyClient: ClientProxy,
    private readonly postRepository: PostRepository,
  ) {}

  async execute({ payload }: DeletePostCommand): Promise<any> {
    const { postId, userId } = payload;
    try {
      // get aggregate
      const post: Post = await this.postRepository.findById(postId);
      if (!post) return Notification.notFound('Post not found');

      // check rights
      if (post.getUserId() !== userId) {
        return Notification.forbidden('Not post owner');
      }

      // delete through aggregate
      post.markAsDeleted();
      await this.postRepository.save(post);

      const photoUrls: string[] =
        post.getPhotos().map((p) => p.getPhotoUrl()) || [];

      // delete files
      const deleteFilesPattern = { cmd: 'deleteFiles' };
      const deleteStorageResult = await firstValueFrom(
        this.storageProxyClient.send(deleteFilesPattern, {
          fileUrls: photoUrls,
          userId,
        }),
      );

      // check result
      if (deleteStorageResult.deletedLength !== photoUrls.length) {
        return Notification.internalError('Partial files deletion');
      }

      return Notification.success();
    } catch (e) {
      console.error('Storage microservice communication error:', e);
      return Notification.internalError('Deletion failed');
    }
  }
}
