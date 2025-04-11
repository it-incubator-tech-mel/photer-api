import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../core/swagger/api-error/error-response.dto';
import { CreatePostDto } from './dto/input/create-post.dto';
import { PostGetPost } from './dto/swagger.dto/post.get-post';
import { CommandBus } from '@nestjs/cqrs';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.decorator';
import { memoryStorage } from 'multer';
import { CreatePostCommand } from '../aplication/use-case/create-post.use-case';
import { OutputPostType } from './dto/output/Output.post.type';
import { GetAllPostsCommand } from '../aplication/use-case/get-all-posts.use-case';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetMyProfileCommand } from '../aplication/use-case/get-my-profile';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject('STORAGE_POST_SERVICE') private storageProxyClient: ClientProxy,
    private commandBus: CommandBus,
    // private storageService: StorageService,
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
  async getAllPosts(): Promise<Observable<OutputPostType[]>> {
    return this.commandBus.execute(new GetAllPostsCommand());
    // return this.storageProxyClient.send<OutputPostType[]>(pattern, payload); // Nest subscribes on Observable and wait for result
  }
  @Get('/:id')
  @ApiOperation({ summary: 'returns post by id' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: PostGetPost,
    content: {
      'application/json': {
        example: {
          statusCode: 200,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  @HttpCode(HttpStatus.OK)
  async getPosts(): Promise<Observable<number>> {
    const pattern = { cmd: 'getPosts' };
    const payload: number[] = [1, 2, 3];

    return this.storageProxyClient.send<number>(pattern, payload); // Nest subscribes on Observable and wait for result
  }
  @UseGuards(BearerAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create new Post' })
  @ApiResponse({
    status: 201,
    description: 'Returns the newly created post',
    type: PostGetPost,
    content: {
      'application/json': {
        example: {
          statusCode: 201,
        },
      },
    },
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
  @UseInterceptors(
    FilesInterceptor('photo', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 600 * 600 },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async createPosts(
    @UploadedFiles() photo: Express.Multer.File,
    @Body() body: CreatePostDto,
    @CurrentUserId() userId: number,
  ) {
    const description = body.description;
    if (!photo) {
      throw new Error('No files uploaded.');
    }
    const pattern = { cmd: 'createPost' };
    try {
      const savePhotos = this.storageProxyClient.send(pattern, {
        photo,
        userId,
        description,
      });
      const data = await firstValueFrom(savePhotos);
      const result = await this.commandBus.execute(new CreatePostCommand(data));
      return { message: 'Post created successfully', post: result };
    } catch (e) {
      return { message: e };
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'update existing posts by id with input model' })
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
  async updatePosts(): Promise<Observable<number>> {
    const pattern = { cmd: 'getPosts' };
    const payload: number[] = [1, 2, 3];

    return this.storageProxyClient.send<number>(pattern, payload); // Nest subscribes on Observable and wait for result
  }

  @Delete('/delete/:id')
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
  async deletePosts(): Promise<Observable<number>> {
    const pattern = { cmd: 'getPosts' };
    const payload: number[] = [1, 2, 3];

    return this.storageProxyClient.send<number>(pattern, payload); // Nest subscribes on Observable and wait for result
  }

  @Get('/Profile/:id')
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
  @HttpCode(HttpStatus.OK)
  async getMyPosts(@Param('id') id: number) {
    const profile = await this.commandBus.execute(new GetMyProfileCommand(id));
    if (!profile) throw new NotFoundException();
    return profile;
  }
}
