import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Notification } from '../../../../../base/notification/notification';
import { ProfileRepository } from '../../infrastructure/profile.repository';
import { firstValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Profile } from '../../domain/profile.entity';

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
  ) {}
  async execute(
    command: UploadAvatarCommand,
  ): Promise<Notification<{ fileUrl: string } | null>> {
    console.log('UploadAvatarCommand', command);
    const { userId, file } = command;

    try {
      const profile: Profile =
        await this.profileRepository.findByUserId(userId);
      // TODO: ???
      if (!profile) {
        return Notification.internalError('Profile does not exist');
      }

      const pattern = { cmd: 'uploadAvatar' };
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

      profile.updateAvatarUrl(uploadResult.fileUrl);

      // save changes after update avatar url
      await this.profileRepository.save(profile);

      return Notification.success({
        fileUrl: profile.getAvatarUrl(),
      });
    } catch (err) {
      console.log('UploadAvatarUseCase error', err);
    }
  }
}
