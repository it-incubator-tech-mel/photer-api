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
import { CreateProfileDocs } from './swagger/create.profile.swagger';
import { ResultStatus } from '../../../../base/notification/notification';
import { Notification } from '../../../../base/notification/notification';
import {
  BadRequestException,
  InternalServerErrorException,
} from '../../../core/exception-filters/exceptions/exception-types';
import { ProfileQueryRepository } from '../infrastructure/profile.query-repository';
import { ProfileOutputDto } from './dto/output/profile.output.dto';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly profileQueryRepository: ProfileQueryRepository,
  ) {}

  @Post()
  @CreateProfileDocs()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUserId() userId: number,
    @Body() dto: CreateProfileDto,
  ): Promise<ProfileOutputDto> {
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

    // console.log('createResult', createResult);
    // console.log('createResult.data', createResult.data);

    switch (createResult.status) {
      case ResultStatus.BadRequest:
        throw new BadRequestException(createResult.extensions);
      case ResultStatus.InternalError:
        throw new InternalServerErrorException();
    }

    return this.profileQueryRepository.findById(
      createResult.data,
      dto.username,
    );
  }
}
