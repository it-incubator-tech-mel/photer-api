import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.decorator';
import { CreateProfileDto } from './dto/input/create-profile.input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { CreateProfileCommand } from '../application/use-case/create-profile.use-case';
import { InternalServerErrorException } from '../../../core/exception-filters/exceptions/exception-types';
import { CreateProfileDocs } from './swagger/create.profile.swagger';
import { ResultStatus } from '../../../../base/notification/notification';
import { Notification } from '../../../../base/notification/notification';
import { BadRequestException } from '../../../core/exception-filters/exceptions/exception-types';

@Controller('profile')
export class ProfileController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @CreateProfileDocs()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUserId() userId: number, @Body() dto: CreateProfileDto) {
    // console.log('userId', userId);
    // console.log('dto', dto);
    const createResult: Notification = await this.commandBus.execute(
      new CreateProfileCommand(
        userId,
        dto.username,
        dto.firstName,
        dto.lastName,
        dto.birthDate ? new Date(dto.birthDate) : undefined,
        dto.country,
        dto.city,
        dto.aboutMe,
      ),
    );

    switch (createResult.status) {
      case ResultStatus.BadRequest:
        throw new BadRequestException(createResult.extensions);
      default:
    }
  }
}
