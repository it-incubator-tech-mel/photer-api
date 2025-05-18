import { UpdatePostDto } from '../../api/dto/input/update-post.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/post.repository';
import { Notification } from '../../../../../base/notification/notification';
import { Post } from '../../domain/post.aggregate';
import { DomainValidationError } from '../../../../../../common/errors/domain-validation-error';

export class UpdatePostCommand {
  constructor(
    public readonly userId: number,
    public readonly postId: number,
    public readonly dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(command: UpdatePostCommand): Promise<Notification> {
    const { userId, postId, dto } = command;

    const post: Post = await this.postRepository.findById(postId);
    if (!post) {
      return Notification.notFound('Post not found');
    }

    if (post.getUserId() !== userId) {
      return Notification.forbidden('Not post owner');
    }

    const newDescription: string = dto.description.trim();
    if (newDescription === post.getDescription()) {
      return Notification.badRequest([
        { field: 'description', message: 'No changes detected' },
      ]);
    }

    try {
      post.updateDescription(newDescription);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        return Notification.badRequest([
          {
            field: error.field,
            message: error.message,
          },
        ]);
      }
      throw error;
    }

    // save changes after update
    await this.postRepository.save(post);

    return Notification.success();
  }
}
