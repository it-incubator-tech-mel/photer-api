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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostOutputDto } from './dto/output/post.output.dto';
import { APIErrorResult } from '../../../core/swagger/api-error/error-response.dto';
import { CreatePostDto } from './dto/input/create-post.input.dto';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject('STORAGE_SERVICE') private storageProxyClient: ClientProxy,
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
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreatePostDto) {
    console.log(body);

    // const pattern = { cmd: 'createPost' };
    // const payload: number[] = [1, 2, 3];

    return { message: 'createPost' };
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
  async update(@Body() body: UpdatePostDto) {
    // const pattern = { cmd: 'updatePost' };
    // const payload: number[] = [1, 2, 3];

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
