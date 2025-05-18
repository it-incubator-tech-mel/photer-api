import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { PhotoRepository } from '../../infrastructure/photo.repository';
import { Notification } from '../../../../../../base/notification/notification';
import { Post } from '../../domain/post.aggregate';

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
  ) {}

  async execute({ payload }: DeletePostCommand): Promise<Notification> {
    const { postId, userId } = payload;

    const post: Post = await this.postRepository.findByIdAndUserId(
      postId,
      userId,
    );

    if (!post) {
      return Notification.forbidden("Post doesn't belongs to current user");
    }

    await this.photoRepository.softDeleteByPostId(postId);
    await this.postRepository.softDelete(postId, userId);

    return Notification.success();
  }
}
