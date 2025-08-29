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
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreatePostDto } from './dto/input/create-post.input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../aplication/use-case/create-post.use-case';
import { PostOutputDto } from './dto/output/post.output.dto';
import { PostQueryRepository } from '../infrastructure/posts.query-repository';
import { DeletePostCommand } from '../aplication/use-case/delete-post.use-case';
import { UpdatePostDto } from './dto/input/update-post.input.dto';
import { UpdatePostCommand } from '../aplication/use-case/update-post.use-case';
import { GetAllPostsDocs } from './swagger/get-all.posts.swagger';
import { GetOnePostDocs } from './swagger/get-one.posts.swagger';
import { CreatePostDocs } from './swagger/create.posts.swagger';
import { UpdatePostDocs } from './swagger/update.posts.swagger';
import { DeletePostDocs } from './swagger/delete.posts.swagger';
import { GetAllUserPostsDocs } from './swagger/get-user-posts.posts.swagger';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '../../../../core/exception-filters/exceptions/exception-types';
import { CurrentUserId } from '../../../../core/decorators/param-decorators/current-user-id.decorator';
import { BearerAuthGuard } from '../../../../core/guards/bearer-auth.guard';
import {
  Notification,
  ResultStatus,
} from '../../../../../base/notification/notification';
import { OptionalJwtAuthGuard } from '../../../../core/guards/optional-jwt-auth.guard';
import { PostPhotosUploadInterceptor } from '../../../../core/interceptors/post-photos-upload.interceptor';
import { OptionalUserId } from '../../../../core/decorators/param-decorators/current-user-optional-user-id.param.decorator';
import { ApiSecurity } from '@nestjs/swagger';
import { PostQueryParams } from './query/get-all-posts.query';
import { BasePaginatedOutputDto } from '../../../../../../common/dto/base-output-dto/base-paginated.output.dto';
import { BaseQueryParams } from '../../../../../../common/dto/base-input-query-params/base.query-params';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private readonly postQueryRepository: PostQueryRepository,
  ) {}

  // TODO: pagesCount not valid (last page is empty)
  @Get()
  @GetAllPostsDocs()
  async getAll(
    @Query() query: PostQueryParams,
  ): Promise<BasePaginatedOutputDto<PostOutputDto[]>> {
    return await this.postQueryRepository.findAll(query);
  }

  // +
  @Get(':id')
  @GetOnePostDocs()
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<PostOutputDto> {
    const result: PostOutputDto = await this.postQueryRepository.findById(id);

    if (!result) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return result;
  }

  // TODO: in use case delete logic from storage if error
  @Post()
  @ApiSecurity('refreshToken')
  @CreatePostDocs()
  @UseInterceptors(PostPhotosUploadInterceptor)
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFiles() photos: Express.Multer.File[],
    @Body() body: CreatePostDto,
    @CurrentUserId() userId: number,
  ) {
    if (!photos?.length) {
      throw new BadRequestException([
        { field: 'photos', message: 'At least one photo is required' },
      ]);
    }

    const createResult: Notification<number | null> =
      await this.commandBus.execute<
        CreatePostCommand,
        Notification<number | null>
      >(
        new CreatePostCommand({
          photos,
          description: body.description,
          userId,
        }),
      );

    if (createResult.status !== ResultStatus.Success || !createResult.data) {
      throw new InternalServerErrorException(createResult.errorMessage);
    }

    return this.postQueryRepository.findById(createResult.data);
  }

  // +
  @Patch(':id')
  @ApiSecurity('refreshToken')
  @UpdatePostDocs()
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

  // +
  @Delete(':id')
  @ApiSecurity('refreshToken')
  @DeletePostDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAuthGuard)
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    const result: Notification = await this.commandBus.execute(
      new DeletePostCommand({
        postId: id,
        userId,
      }),
    );

    switch (result.status) {
      case ResultStatus.Success:
        return;
      case ResultStatus.NotFound:
        throw new NotFoundException(result.errorMessage);
      case ResultStatus.Forbidden:
        throw new ForbiddenException(result.errorMessage);
      default:
        throw new InternalServerErrorException(result.errorMessage);
    }
  }

  // +
  @Get('users/:id')
  @GetAllUserPostsDocs()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserPosts(
    @Param('id') userId: number,
    // @Request() req: { user: { userId: number | null } },
    @Query() query: BaseQueryParams,
    @OptionalUserId() optionalUserId: number | null,
  ): Promise<BasePaginatedOutputDto<PostOutputDto[] | null>> {
    const posts: BasePaginatedOutputDto<PostOutputDto[] | null> =
      await this.postQueryRepository.findUserPosts(
        userId,
        query,
        optionalUserId,
      );

    if (!posts) throw new NotFoundException();

    return posts;
  }
}
