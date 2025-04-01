import { Controller } from '@nestjs/common';
import { StorageService } from './storage.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @MessagePattern({ cmd: 'getPosts' })
  async accumulate(data: number[]): Promise<number> {
    console.log('data', data);
    return (data || []).reduce((a, b) => a + b);
  }
}
