import { Controller } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from './features/post/aplication/create-post.use-case';

@Controller()
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern({ cmd: 'createPost' })
  async createOnePost(payload: {
    files: {
      buffer: Buffer;
      originalName: string;
      mimetype: string;
    }[];
    userId: number;
  }) {
    return this.commandBus.execute(new CreatePostCommand(payload));
  }
}
