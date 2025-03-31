import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class PostsSenderController {
  constructor() {}
  @MessagePattern({ cmd: 'testing/posts' })
  async getNotifications(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<string> {
    console.log('Message received');
    console.log(`Pattern: ${context.getPattern()}`);
    console.log(`123`);
    console.log(context.getMessage());
    console.log(context.getChannelRef());
    return 'complete!';
  }
}
