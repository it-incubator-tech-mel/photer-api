import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { ApiOperation } from '@nestjs/swagger';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject('STORAGE_SERVICE') private storageProxyClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all posts',
  })
  async getPosts(): Promise<Observable<number>> {
    const pattern = { cmd: 'getPosts' };
    const payload: number[] = [1, 2, 3];

    return this.storageProxyClient.send<number>(pattern, payload); // Nest subscribes on Observable and wait for result
    // res Observable {
    //   source: Observable { _subscribe: [Function (anonymous)] },
    //   operator: [Function (anonymous)]
    // }
  }
}
