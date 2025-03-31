import { Controller, Get, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PostsService } from './posts.service';

@Controller('/posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly postsService: PostsService,
  ) {}
  @Get('create')
  async createPosts() {
    return this.postsService.create(123);
  }
}
