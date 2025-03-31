import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class PostsSenderController {
  constructor() {}
  @MessagePattern({ cmd: 'testing/posts' })
  async getNotifications(@Payload() data: any): Promise<string> {
    console.log('Message received');
    console.log(`123`);
    console.log(data, 'data');
    return 'complete!';
  }
}
