import { Controller } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { Notification } from '../../gateway/base/notification/notification';
import { RegistrationUserCommand } from '../../gateway/src/features/auth/application/use-cases/registration.use-case';
import { CreatePostCommand } from '@storage/post/aplication/create-post.use-case';

@Controller()
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly commandBus: CommandBus,
  ) {}

  // @MessagePattern({ cmd: 'createPost' })
  // async createOnePost(file: { photo: any; userId: number }) {
  //   const buffer = Buffer.from(file.photo.buffer.data);
  //   const payloadPhoto = {
  //     buffer: buffer, // передаем правильный Buffer
  //     filename: file.photo.filename,
  //     mimetype: file.photo.mimetype,
  //   };
  //
  //   file = {
  //     photo: payloadPhoto,
  //     userId: file.userId,
  //   };
  //   return this.storageService.uploadStream(file);
  // }
  @MessagePattern({ cmd: 'createPost' })
  async createOnePost(file: { photo: any[]; userId: number }) {
    const result = await this.commandBus.execute(new CreatePostCommand(file));
    return result;
  }
  // @MessagePattern({ cmd: 'getPosts' })
  // async accumulate(data: number[]): Promise<number> {
  //   console.log('data', data);
  //   return (data || []).reduce((a, b) => a + b);
  // }
  // @MessagePattern({ cmd: 'getPosts' })
  // async accumulate(data: number[]): Promise<number> {
  //   console.log('data', data);
  //   return (data || []).reduce((a, b) => a + b);
  // }
}
