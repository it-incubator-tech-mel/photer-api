import { Controller } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

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
  async createOnePost(file: { photo: any; userId: number }) {
    const buffer = Buffer.from(file.photo.buffer.data);
    const payloadPhoto = {
      buffer: buffer, // передаем правильный Buffer
      filename: file.photo.originalname,
      mimetype: file.photo.mimetype,
    };
    file = {
      photo: payloadPhoto,
      userId: file.userId,
    };
    return this.storageService.uploadStream(file);
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
