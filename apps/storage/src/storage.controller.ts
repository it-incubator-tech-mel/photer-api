import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { StorageService } from './storage.service';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @MessagePattern('upload_file')
  async uploadFile(
    @Payload() data: { file: Buffer; filename: string; mimetype: string },
  ) {
    return this.storageService.uploadFile(data);
  }

  @MessagePattern('delete_file')
  async deleteFile(@Payload() data: { url: string }) {
    return this.storageService.deleteFile(data.url);
  }

  @MessagePattern('process_image')
  async processImage(
    @Payload() data: { file: Buffer; filename: string; operations: any[] },
  ) {
    return this.storageService.processImage(data);
  }
}
