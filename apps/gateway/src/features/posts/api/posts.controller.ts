import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { APIErrorResult } from '../../../core/swagger/api-error/error-response.dto';
import { CreatePostDto } from './dto/input/create-post.input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.decorator';
import { memoryStorage } from 'multer';
import { CreatePostCommand } from '../aplication/use-case/create-post.use-case';
import { PostOutputDto } from './dto/output/post.output.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostQueryRepository } from '../infrastructure/posts.query.repository';
import { FilesRequiredPipe } from '../../../core/pipes/files-required.pipe';
import { DeletePostCommand } from '../aplication/use-case/delete-post.use-case';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '../../../core/exception-filters/exceptions/exception-types';
import { ResultStatus } from '../../../../base/notification/notification';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject('STORAGE_POST_SERVICE')
    private storageProxyClient: ClientProxy,
    private readonly postQueryRepository: PostQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [PostOutputDto],
  })
  @HttpCode(HttpStatus.OK)
  async getAll(): Promise<PostOutputDto[]> {
    return this.postQueryRepository.getAll();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Returns post by id' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: PostOutputDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  @HttpCode(HttpStatus.OK)
  async getOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<PostOutputDto> {
    const result: PostOutputDto = await this.postQueryRepository.getOne(id);

    if (!result) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create new post' })
  @ApiResponse({
    status: 201,
    description: 'Returns the newly created post',
    type: PostOutputDto,
  })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
    type: APIErrorResult,
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Validation failed',
          errorsMessages: [],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multipart form data for post creation',
    required: true,
    type: CreatePostDto,
  })
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 20 * 1024 * 1024, // 20Mb
        files: 10, // max 10 photos
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException([
              {
                message: 'Invalid file format. Only JPEG/PNG are allowed.',
                field: 'photos',
              },
            ]),
            false,
          );
        }
      },
    }),
  )
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFiles(FilesRequiredPipe) files: Express.Multer.File[],
    @Body() body: CreatePostDto,
    @CurrentUserId() userId: number,
  ) {
    const pattern = { cmd: 'uploadFiles' };

    const uploaded = await firstValueFrom(
      this.storageProxyClient.send(pattern, {
        files: files.map((f) => ({
          buffer: f.buffer,
          originalName: f.originalname,
          mimetype: f.mimetype,
        })),
        userId,
      }),
    );

    return this.commandBus.execute(
      new CreatePostCommand({
        fileUrls: uploaded.fileUrls,
        userId,
        description: body.description,
      }),
    );
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update existing posts by id with input model' })
  @ApiResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
    type: APIErrorResult,
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'Validation failed',
          errorsMessages: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(): Promise<Observable<number>> {
    const pattern = { cmd: 'getPosts' };
    const payload: number[] = [1, 2, 3];

    return this.storageProxyClient.send<number>(pattern, payload); // Nest subscribes on Observable and wait for result
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'returns post by id' })
  @ApiResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAuthGuard)
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    const post = await this.postQueryRepository.findByIdWithPhotos(id, userId);

    const deleteFilesPattern = { cmd: 'deleteFiles' };
    const deletedLength = await firstValueFrom(
      this.storageProxyClient.send(deleteFilesPattern, {
        fileUrls: post.photos.map((p) => p.photoUrl),
        userId,
      }),
    );

    // [Nest] 11852  - 04/24/2025, 5:47:01 PM   ERROR [ExceptionsHandler] Object(2) {
    //   status: 'error',
    //     message: 'Internal server error'
    // }

    if (post.photos.length === deletedLength) {
      const result = await this.commandBus.execute(
        new DeletePostCommand({ postId: id, userId }),
      );
      if (result.status === ResultStatus.Forbidden) {
        throw new ForbiddenException(result.errorMessage);
      }
    } else {
      throw new InternalServerErrorException();
    }
  }

  @Get('/profile/:id')
  @ApiOperation({
    summary: 'Returns profile - (unauthorized user has access to only 8 posts)',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [PostOutputDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  @HttpCode(HttpStatus.OK)
  async getMyPosts(@Param('id') id: number) {
    const result: PostOutputDto[] =
      await this.postQueryRepository.findUserProfile(id);

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }
}
