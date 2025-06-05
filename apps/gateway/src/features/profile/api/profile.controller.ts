import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
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
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '../../../core/exception-filters/exceptions/exception-types';
import { ProfileQueryRepository } from '../infrastructure/profile.query-repository';
import { ProfileOutputDto } from './dto/output/profile.output.dto';
import { GetOneProfileDocs } from './swagger/get-one.profile.swagger';
import { ApiSecurity } from '@nestjs/swagger';
import { UpdateProfileDocs } from './swagger/update.profile.swagger';
import { UpdateProfileDto } from './dto/input/update-profile.input.dto';
import { UpdateProfileCommand } from '../application/use-case/update-profile.use-case';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly profileQueryRepository: ProfileQueryRepository,
  ) {}

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

  // !!!
  @Patch(':id')
  @ApiSecurity('refreshToken')
  @UpdateProfileDocs()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) profileId: number,
    @Body() dto: UpdateProfileDto,
  ): Promise<void> {
    const result: Notification = await this.commandBus.execute<
      UpdateProfileCommand,
      Notification
    >(
      new UpdateProfileCommand(
        profileId,
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

    switch (result.status) {
      case ResultStatus.NotFound:
        throw new NotFoundException(result.errorMessage);
      case ResultStatus.Forbidden:
        throw new ForbiddenException(result.errorMessage);
      case ResultStatus.BadRequest:
        throw new BadRequestException(result.extensions);
      case ResultStatus.Success:
        return;
      default:
        throw new InternalServerErrorException('Unexpected error');
    }
  }
}
