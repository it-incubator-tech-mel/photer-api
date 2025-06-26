import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Notification } from '../../../../../base/notification/notification';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { firstValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Profile } from '../../domain/profile.entity';
import { DeleteOldAvatarEvent } from '../../../content/post/aplication/use-case/old-avatar-delete.event';

export class UploadAvatarCommand {
  constructor(
    public readonly userId: number,
    public readonly file: Express.Multer.File,
  ) {}
}

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarUseCase
  implements ICommandHandler<UploadAvatarCommand>
{
  constructor(
    @Inject('STORAGE_POST_SERVICE')
    private storageProxyClient: ClientProxy,
    public readonly profileRepository: ProfileRepository,
    private readonly eventBus: EventBus,
  ) {}
  async execute(
    command: UploadAvatarCommand,
  ): Promise<Notification<{ fileUrl: string } | null>> {
    const { userId, file } = command;

    try {
      // find or create profile
      let profile: Profile = await this.profileRepository.findByUserId(userId);
      if (!profile) {
        profile = Profile.createBasic(userId);
        await this.profileRepository.save(profile);
      }

      // send to storage microservice
      const pattern = { cmd: 'upload_avatar' };
      const uploadResult: { fileUrl: string; userId: number } =
        await firstValueFrom(
          this.storageProxyClient.send(pattern, {
            file: {
              buffer: file.buffer,
              originalName: file.originalname,
              mimetype: file.mimetype,
            },
            userId,
          }),
        );

      if (
        !uploadResult?.fileUrl ||
        (uploadResult.fileUrl as string).length === 0
      ) {
        Notification.internalError('No file URL received');
      }

      // update old avatar and delete it from storage
      const oldAvatarUrl: string = profile.getAvatarUrl();
      profile.updateAvatarUrl(uploadResult.fileUrl);
      await this.profileRepository.save(profile);

      if (oldAvatarUrl) {
        this.eventBus.publish(new DeleteOldAvatarEvent(oldAvatarUrl));
      }

      // save changes after update avatar url
      await this.profileRepository.save(profile);

      return Notification.success({ fileUrl: uploadResult.fileUrl });
    } catch (err) {
      console.log('UploadAvatarUseCase error', err);
      return Notification.internalError('Failed to upload avatar');
    }
  }
}
