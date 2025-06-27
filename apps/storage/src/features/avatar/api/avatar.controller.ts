import { BadRequestException, Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { DeleteAvatarInputDto } from './dto/input/delete-avatar.input.dto';
import { UploadPostPhotoInputDto } from '../../post-photo/api/dto/input/upload-post-photo.input.dto';
import { UploadAvatarCommand } from '../application/use-cases/upload-avatar.use-case';
import { DeleteAvatarCommand } from '../application/use-cases/delete-avatar.use-case';

@Controller()
export class AvatarController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern({ cmd: 'upload_avatar' })
  async uploadAvatar(payload: UploadPostPhotoInputDto): Promise<{
    fileUrl: string;
    userId: number;
  }> {
    // converts payload object into instance of the UploadFilesInputDto class
    const dto: UploadPostPhotoInputDto = plainToInstance(
      UploadPostPhotoInputDto,
      payload,
    );

    // validate dto using class-validator
    const errors: ValidationError[] = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.commandBus.execute(new UploadAvatarCommand(dto));
  }

  @MessagePattern({ cmd: 'delete_avatar' })
  async deleteAvatar(payload: DeleteAvatarInputDto) {
    console.log('in deleteAvatar MessagePattern');
    // converts payload object into instance of the DeleteAvatarInputDto class
    const dto: DeleteAvatarInputDto = plainToInstance(
      DeleteAvatarInputDto,
      payload,
    );

    // validate dto using class-validator
    const errors: ValidationError[] = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.commandBus.execute(new DeleteAvatarCommand(dto));
  }
}
