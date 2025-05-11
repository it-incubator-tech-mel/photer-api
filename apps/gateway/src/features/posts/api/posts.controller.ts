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
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreatePostDto } from './dto/input/create-post.input.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.decorator';
import { CreatePostCommand } from '../aplication/use-case/create-post.use-case';
import { PostOutputDto } from './dto/output/post.output.dto';
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
import { OptionalJwtAuthGuard } from '../../../core/guards/optional-jwt-auth.guard';
import { PaginatedViewDto } from '../../../../base/dto/base.paginated.view-dto';
import { createFilesInterceptor } from '../../../core/decorators/param-decorators/useInterceptorsForCreatePhoto.decorator';
import { SwaggerGetPosts } from '../../../core/swagger/post-swagger/GetAllPosts.swagger';
import { SwaggerGetPostsById } from '../../../core/swagger/post-swagger/GetOnePostById.swagger';
import { SwaggerDeletePost } from '../../../core/swagger/post-swagger/DeletePost.swagger';
import { SwaggerUpdatePosts } from '../../../core/swagger/post-swagger/UpdatePost.swagger';
import { SwaggerCreatePosts } from '../../../core/swagger/post-swagger/CreatePost.swagger';
import { SwaggerGetUserProfile } from '../../../core/swagger/post-swagger/getUserProfile.swagger';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject('STORAGE_POST_SERVICE')
    private storageProxyClient: ClientProxy,
    private readonly postQueryRepository: PostQueryRepository,
    private commandBus: CommandBus,
    private postRepository: PostQueryRepository,
  ) {}

  @Get()
  @SwaggerGetPosts()
  async getAllPosts(
    @Query() query: BaseQueryParams,
    // ): Promise<Observable<PaginatedViewDto<PostOutputDto[]>>> {
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    return this.postRepository.findAllPosts(query);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @SwaggerGetPostsById()
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
  @UseInterceptors(createFilesInterceptor())
  @SwaggerCreatePosts()
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
    return this.commandBus.execute(
      new CreatePostCommand({ ...data, description }),
    );
  }

  @Patch('/:id')
  @SwaggerUpdatePosts()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) postId: number,
    @Param('id') Id: number,
    @Body() body: UpdatePostDto,
  ): Promise<void> {
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
  @SwaggerDeletePost()
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

  // @Get('profile/:id')
  // @ApiOperation({
  //   summary: 'returns profile - (unauthorized user has access to only 8 posts)',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Success',
  //   type: [PostGetPost],
  //   content: {
  //     'application/json': {
  //       example: {
  //         statusCode: 201,
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Not Found',
  // })
  // // @UseGuards()
  // @HttpCode(HttpStatus.OK)
  // async getMyPosts(@Query() query: BaseQueryParams, @Param('id') id: number) {
  //   const profile = await this.commandBus.execute(
  //     new GetMyProfileCommand(id, query),
  //   );
  //   if (!profile) throw new NotFoundException();
  //   return profile;
  // }

  @Get('user/:id')
  @SwaggerGetUserProfile()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserPosts(
    @Param('id') id: number,
    @Request() req: { user: { userId: number | null } },
    @Query() query: BaseQueryParams,
  ): Promise<PaginatedViewDto<PostOutputDto[] | null>> {
    const posts: PaginatedViewDto<PostOutputDto[] | null> =
      await this.postRepository.findUserProfile(id, query, req.user.userId);

    if (!posts) throw new NotFoundException();

    return posts;
  }
}
