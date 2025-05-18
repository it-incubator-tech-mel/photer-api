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
import { CommandBus } from '@nestjs/cqrs';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.decorator';
import { memoryStorage } from 'multer';
import { CreatePostCommand } from '../aplication/use-case/create-post.use-case';
import { PostOutputDto } from './dto/output/post.output.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostQueryRepository } from '../infrastructure/posts.query-repository';
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
import { BaseQueryParams } from '../../../../base/dto/base-input-query-params/base.query-params';
import { OptionalJwtAuthGuard } from '../../../core/guards/optional-jwt-auth.guard';
import { BasePaginatedOutputDto } from '../../../../base/dto/base-output-dto/base-paginated.output.dto';
import { GetAllPostsDocs } from './swagger/get-all.posts.swagger';
import { GetOnePostDocs } from './swagger/get-one.posts.swagger';
import { CreatePostDocs } from './swagger/create.posts.swagger';
import { UpdatePostDocs } from './swagger/update.posts.swagger';
import { DeletePostDocs } from './swagger/delete.posts.swagger';
import { GetAllUserPostsDocs } from './swagger/get-user-posts.posts.swagger';
import { PostQueryParams } from '../../../../../storage/src/features/post/api/query/get-all-post.query';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject('STORAGE_POST_SERVICE')
    // private storageProxyClient: ClientProxy,
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
    console.log('typeof id', typeof id);
    const result: PostOutputDto = await this.postQueryRepository.findById(id);

    if (!result) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return result;
  }

  // -
  @Post()
  @CreatePostDocs()
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
    @UploadedFiles() photos: Express.Multer.File[],
    @Body() body: CreatePostDto,
    @CurrentUserId() userId: number,
  ) {
    if (!photos || photos.length === 0) {
      throw new Error('No files uploaded.');
    }

    const description: string = body.description;

    const result = await this.commandBus.execute(
      new CreatePostCommand({ photos, description, userId }),
    );

    return result;

    // if (!photos || photos.length === 0) {
    //   throw new Error('No files uploaded.');
    // }
    // const description = body.description;
    // const pattern = { cmd: 'uploadFiles' };
    // const savePhotos = this.storageProxyClient.send(pattern, {
    //   files: photos.map((f) => ({
    //     buffer: f.buffer,
    //     originalName: f.originalname,
    //     mimetype: f.mimetype,
    //   })),
    //   userId,
    // });
    //
    // const data = await firstValueFrom(savePhotos);
    // const result = await this.commandBus.execute(
    //   new CreatePostCommand({ ...data, description }),
    // );
    // return result;
  }

  // -
  @Patch(':id')
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

  // -
  @Delete(':id')
  @DeletePostDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAuthGuard)
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new DeletePostCommand({
        postId: id,
        userId,
      }),
    );

    switch (result.status) {
      case ResultStatus.NotFound:
        throw new NotFoundException(result.message);
      case ResultStatus.Forbidden:
        throw new ForbiddenException(result.message);
      default:
        throw new InternalServerErrorException(result.message);
    }
  }

  // -
  @Get('users/:id')
  @GetAllUserPostsDocs()
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserPosts(
    @Param('id') id: number,
    @Request() req: { user: { userId: number | null } },
    @Query() query: BaseQueryParams,
  ): Promise<BasePaginatedOutputDto<PostOutputDto[] | null>> {
    const posts: BasePaginatedOutputDto<PostOutputDto[] | null> =
      await this.postQueryRepository.findUserPosts(id, query, req.user.userId);

    if (!posts) throw new NotFoundException();

    return posts;
  }
}
