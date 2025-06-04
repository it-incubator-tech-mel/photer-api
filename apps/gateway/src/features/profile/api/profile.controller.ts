import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
  NotFoundException,
} from '../../../core/exception-filters/exceptions/exception-types';
import { ProfileQueryRepository } from '../infrastructure/profile.query-repository';
import { ProfileOutputDto } from './dto/output/profile.output.dto';
import { PostOutputDto } from '../../content/post/api/dto/output/post.output.dto';
import { GetOneProfileDocs } from './swagger/get-one.profile.swagger';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly profileQueryRepository: ProfileQueryRepository,
  ) {}

  // +
  @Post()
  @ApiSecurity('refreshToken')
  @CreateProfileDocs()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUserId() userId: number,
    @Body() dto: CreateProfileDto,
  ): Promise<ProfileOutputDto> {
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
      case ResultStatus.InternalError:
        throw new InternalServerErrorException();
    }

    return this.profileQueryRepository.findById(createResult.data);
  }

  // +
  @Get(':id')
  @GetOneProfileDocs()
  @HttpCode(HttpStatus.OK)
  async getOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProfileOutputDto> {
    const result: ProfileOutputDto =
      await this.profileQueryRepository.findById(id);

    if (!result) {
      throw new NotFoundException(`Profile with id ${id} not found`);
    }

    return result;
  }
}
