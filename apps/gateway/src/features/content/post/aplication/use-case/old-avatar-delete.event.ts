import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export class DeleteOldAvatarEvent {
  constructor(public readonly oldAvatarUrl: string) {}
}

@EventsHandler(DeleteOldAvatarEvent)
export class DeleteOldAvatarEventHandler
  implements IEventHandler<DeleteOldAvatarEvent>
{
  constructor(
    @Inject('STORAGE_POST_SERVICE')
    private storageProxyClient: ClientProxy,
  ) {}

  async handle(event: DeleteOldAvatarEvent): Promise<void> {
    const pattern = { cmd: 'delete_avatar' };

    try {
      console.log('in event');
      const result: boolean = await firstValueFrom(
        this.storageProxyClient.send<boolean>(pattern, {
          fileUrl: event.oldAvatarUrl,
        }),
      );

      if (!result) {
        console.log('Failed to delete avatar');
        throw new Error('Failed to delete avatar');
      }
    } catch (error) {
      console.log('Deleting avatar error', error);
      throw new Error('Deleting avatar error');
    }
  }
}
