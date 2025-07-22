import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { GetByProfileIdDocs } from './swagger/get-by-profile-id.profile.swagger';
import { ApiSecurity } from '@nestjs/swagger';
import { UpdateProfileDocs } from './swagger/update.profile.swagger';
import { UpdateProfileDto } from './dto/input/update-profile.input.dto';
import { UpdateProfileCommand } from '../application/use-case/update-profile.use-case';
import { DeleteProfileDocs } from './swagger/delete.profile.swagger';
import { DeleteProfileCommand } from '../application/use-case/delete-profile.use-case';
import { UploadProfileAvatarDocs } from './swagger/upload.profile-avatar.swagger';
import { UploadAvatarInterceptor } from './interceptors/upload-avatar.interceptor';
import { UploadAvatarOutputDto } from './dto/output/upload-avatar.output.dto';
import { UploadAvatarCommand } from '../application/use-case/upload-avatar.use-case';
import { parseDateFromDdMmYyyy } from '../../../../base/utils/parse-date-from-DdMmYyyy';
import { GetCurrentUserProfileDocs } from './swagger/get-current-user.profile.swagger';
import { GetProfileByUserIdDocs } from './swagger/get-by-user-id.profile.swagger';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly profileQueryRepository: ProfileQueryRepository,
  ) {}

  @Get(':id')
  @GetByProfileIdDocs()
  @HttpCode(HttpStatus.OK)
  async getProfileById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProfileOutputDto> {
    const result: ProfileOutputDto =
      await this.profileQueryRepository.findById(id);

    if (!result) {
      throw new NotFoundException(`Profile with id ${id} not found`);
    }

    return result;
  }

  @Get()
  @ApiSecurity('refreshToken')
  @GetCurrentUserProfileDocs()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUserProfile(
    @CurrentUserId() userId: number,
  ): Promise<ProfileOutputDto> {
    const result: ProfileOutputDto =
      await this.profileQueryRepository.findByUserId(userId);

    if (!result) {
      throw new NotFoundException(
        `Profile for user with id ${userId} not found`,
      );
    }

    return result;
  }

  @Get('user/:id')
  @GetProfileByUserIdDocs()
  @HttpCode(HttpStatus.OK)
  async getProfileByUserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProfileOutputDto> {
    const result: ProfileOutputDto =
      await this.profileQueryRepository.findByUserId(id);

    if (!result) {
      throw new NotFoundException(
        `Profile for user with id ${id} not found`,
      );
    }

    return result;
  }

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
        dto.birthDate ? parseDateFromDdMmYyyy(dto.birthDate) : undefined,
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

  @Delete()
  @ApiSecurity('refreshToken')
  @DeleteProfileDocs()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUserId() userId: number): Promise<void> {
    const result: Notification = await this.commandBus.execute(
      new DeleteProfileCommand(userId),
    );

    switch (result.status) {
      case ResultStatus.Success:
        return;
      case ResultStatus.NotFound:
        throw new NotFoundException(result.errorMessage);
      default:
        throw new InternalServerErrorException(result.errorMessage);
    }
  }

  @Post('avatar')
  @ApiSecurity('refreshToken')
  @UploadProfileAvatarDocs()
  @UseInterceptors(UploadAvatarInterceptor)
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async uploadAvatar(
    @CurrentUserId() userId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadAvatarOutputDto> {
    if (!file) {
      throw new BadRequestException([
        {
          field: 'file',
          message: 'Avatar file is required',
        },
      ]);
    }

    const uploadResult: Notification<{ fileUrl: string } | null> =
      await this.commandBus.execute<
        UploadAvatarCommand,
        Notification<{ fileUrl: string } | null>
      >(new UploadAvatarCommand(userId, file));

    return {
      fileUrl: uploadResult.data.fileUrl,
    };
  }
}
