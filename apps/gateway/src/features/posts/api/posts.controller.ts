import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PostOutputDto } from './dto/output/post.output.dto';
import { APIErrorResult } from '../../../core/swagger/api-error/error-response.dto';
import { CreatePostDto } from './dto/input/create-post.input.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CommandBus } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUserId } from '../../../../../common/decorators/param-decorators/current-user-id.decorator';
import { BadRequestException } from '../../../core/exception-filters/exceptions/exception-types';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { FilesRequiredPipe } from '../../../core/pipes/files-required.pipe';
import { Observable } from 'rxjs';
import { CreatePostCommand } from '../application/use-cases/create-post.use-case';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject('STORAGE_SERVICE') private storageProxyClient: ClientProxy,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [PostOutputDto],
    content: {
      'application/json': {
        example: [
          {
            id: '1',
            description: 'First post',
            photos: ['https://example.com/photo1.jpg'],
            createdAt: '2025-04-02T08:29:22.243Z',
            updatedAt: '2025-04-02T08:29:22.243Z',
          },
        ],
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAll() {
    //async getPosts(): Promise<Observable<number>> {
    // const pattern = { cmd: 'getPosts' };
    // const payload: number[] = [1, 2, 3];

    // return this.storageProxyClient.send<number>(pattern, payload); // Nest subscribes on Observable and wait for result
    // res Observable {
    //   source: Observable { _subscribe: [Function (anonymous)] },
    //   operator: [Function (anonymous)]
    // }

    return { message: 'getPosts' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Return post by id' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: PostOutputDto,
    content: {
      'application/json': {
        example: {
          id: '1',
          description: 'First post',
          photos: ['https://example.com/photo1.jpg'],
          createdAt: '2025-04-02T08:29:22.243Z',
          updatedAt: '2025-04-02T08:29:22.243Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id') id: string) {
    // const pattern = { cmd: 'getPost' };
    // const payload: number[] = [1, 2, 3];

    return { message: 'getPost' };
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
    @UploadedFiles(FilesRequiredPipe) photos: Express.Multer.File[],
    @Body() body: CreatePostDto,
    @CurrentUserId() userId: number,
  ) {
    console.log('photos', photos);
    console.log('body', body);
    const pattern = { cmd: 'uploadFiles' };

    const data = {
      files: photos.map((file) => ({
        ...file,
        buffer: file.buffer.toString('base64'), // convert Buffer to base64
      })),
      userId,
    };

    const savedPhoto: Observable<any> = this.storageProxyClient.send(
      pattern,
      data,
    );

    // savedPhoto.subscribe({
    //   next: (response) => {
    //     console.log('✅ Storage response:', response);
    //   },
    //   error: (err) => {
    //     console.error('❌ Storage error:', err);
    //   },
    //   complete: () => {
    //     console.log('🔥 Storage request completed');
    //   },
    // });

    savedPhoto.subscribe({
      next: (data) => {
        console.log('✅ Storage response:', data);
        return this.commandBus.execute(
          new CreatePostCommand({
            urls: data.urls,
            userId,
            description: body.description || null,
          }),
        );
      },
    });
  }

  @Put(':id')
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
  async update() {
    return { message: 'updatePost' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete post specified by id' })
  @ApiResponse({
    status: 204,
    description: 'No Content',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'If specified post does not exist',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    // const pattern = { cmd: 'deletePosts' };
    // const payload: number[] = [1, 2, 3];
    // return this.storageProxyClient.send<number>(pattern, payload); // Nest subscribes on Observable and wait for result

    return;
  }
}
