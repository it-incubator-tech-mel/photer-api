import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../core/swagger/api-error/error-response.dto';
import { CreatePostDto } from './dto/input/create-post.dto';
import { PostGetPost } from './dto/swagger.dto/post.get-post';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject('STORAGE_SERVICE') private storageProxyClient: ClientProxy,
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
  async getAllPosts() {
    //: Promise<Observable<number>>
    const pattern = { cmd: 'getPosts' };
    const payload: number[] = [1, 2, 3];

    return { message: 'registration' };
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
  async getPosts() {
    const pattern = { cmd: 'getPosts' };
    const payload: number[] = [1, 2, 3];

    return { message: 'registration' };
  }

  @Post('/create')
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
  @ApiResponse({
    status: 404,
    description: 'Not Found',
  })
  @HttpCode(HttpStatus.CREATED)
  async createPosts(@Body() body: CreatePostDto) {
    const pattern = { cmd: 'getPosts' };
    const payload: number[] = [1, 2, 3];
    console.log(body);

    return { message: 'registration' };
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
  async updatePosts() {
    const pattern = { cmd: 'getPosts' };
    const payload: number[] = [1, 2, 3];

    return { message: 'registration' };
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
  async deletePosts() {
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
  async getMyPosts() {
    const pattern = { cmd: 'getPosts' };
    const payload: number[] = [1, 2, 3];

    return { message: 'registration' };
  }
}
