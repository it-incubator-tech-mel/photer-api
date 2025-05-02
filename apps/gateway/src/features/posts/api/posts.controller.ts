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
  Patch,
  Post,
  Query,
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
import { DeletePostCommand } from '../aplication/use-case/delete-post.use-case';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '../../../core/exception-filters/exceptions/exception-types';
import { ResultStatus } from '../../../../base/notification/notification';
import { UpdatePostDto } from './dto/input/update-post.input.dto';
import { UpdatePostCommand } from '../aplication/use-case/update-post.use-case';
import { BaseQueryParams } from '../../../../base/dto/base.query-param';
import { GetAllPostsCommand } from '../aplication/use-case/get-all-posts.use-case';
import { PostGetPost } from './dto/swagger.dto/post.get-post';
import { GetMyProfileCommand } from '../aplication/use-case/get-my-profile';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject('STORAGE_POST_SERVICE')
    private storageProxyClient: ClientProxy,
    private readonly postQueryRepository: PostQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all posts',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [PostGetPost],
    content: {
      'application/json': {
        example: {
          statusCode: 200,
        },
      },
    },
  })
  async getAllPosts(
    @Query() query: BaseQueryParams,
  ): Promise<Observable<PostOutputDto[]>> {
    return this.commandBus.execute(new GetAllPostsCommand(query));
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
  async createPosts(
    @UploadedFiles() photos: Express.Multer.File[],
    @Body() body: CreatePostDto,
    @CurrentUserId() userId: number,
  ) {
    if (!photos || photos.length === 0) {
      throw new Error('No files uploaded.');
    }
    const description = body.description;
    const pattern = { cmd: 'uploadFiles' };
    const savePhotos = this.storageProxyClient.send(pattern, {
      files: photos.map((f) => ({
        buffer: f.buffer,
        originalName: f.originalname,
        mimetype: f.mimetype,
      })),
      userId,
    });

    const data = await firstValueFrom(savePhotos);
    const result = await this.commandBus.execute(
      new CreatePostCommand({ ...data, description }),
    );
    return result;
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update existing post' })
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
    status: 403,
    description: 'If try to update post of other user',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) postId: number,
    @Param('id') Id: number,
    @Body() body: UpdatePostDto,
  ): Promise<void> {
    console.log(postId);
    console.log(userId);
    console.log(body);
    console.log(Id);
    const result = await this.commandBus.execute(
      new UpdatePostCommand(userId, postId, body),
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
    status: 403,
    description: 'If try to delete post of other user',
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
    const post = await this.postQueryRepository.findByIdWithPhotos(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('Not post owner');
    }

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

  @Get('profile/:id')
  @ApiOperation({
    summary: 'returns profile - (unauthorized user has access to only 8 posts)',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [PostGetPost],
    content: {
      'application/json': {
        example: {
          statusCode: 201,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  // @UseGuards()
  @HttpCode(HttpStatus.OK)
  async getMyPosts(@Query() query: BaseQueryParams, @Param('id') id: number) {
    const profile = await this.commandBus.execute(
      new GetMyProfileCommand(id, query),
    );
    if (!profile) throw new NotFoundException();
    return profile;
  }
}
