import { Controller } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { GetAllPostsCommand } from '@storage/post/application/use-case/get-all-posts.use-case';
import { OutputPostType } from '@posts/api/dto/output/Output.post.type';

@Controller()
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern({ cmd: 'getAllPosts' })
  async getAllPosts(): Promise<OutputPostType[]> {
    return this.commandBus.execute(new GetAllPostsCommand());
  }
  @MessagePattern({ cmd: 'createPost' })
  async createOnePost(data: number[]): Promise<number> {
    console.log('data', data);
    return 1;
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
