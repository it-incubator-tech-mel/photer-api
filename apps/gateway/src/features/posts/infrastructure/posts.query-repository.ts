import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostOutputDto } from '../api/dto/output/post.output.dto';
import { BaseQueryParams } from '../../../../base/dto/base.query-param';
import { PaginatedViewDto } from '../../../../base/dto/base.paginated.view-dto';

@Injectable()
export class PostQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findAllPosts(
    query: BaseQueryParams,
  ): Promise<PaginatedViewDto<PostOutputDto[]>> {
    const totalCount = await this.prisma.post.count();

    const foundPosts = await this.prisma.post.findMany({
      where: { status: 'public', isDeleted: false },
      orderBy: { [query.sortBy]: query.sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
      include: {
        photos: { where: { isDeleted: false } },
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    const mappedToPosts = foundPosts.map((post) => this.mapToOutput(post));

    return PaginatedViewDto.mapToView({
      items: mappedToPosts,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
    });
  }

  async findById(id: number): Promise<PostOutputDto | null> {
    const foundPost = await this.prisma.post.findUnique({
      where: { id: id, status: 'public', isDeleted: false },
      include: {
        photos: { where: { isDeleted: false } },
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!foundPost) return null;

    return this.mapToOutput(foundPost);
  }

  async findByIdWithPhotos(id: number) {
    return this.prisma.post.findUnique({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        photos: {
          where: { isDeleted: false },
        },
        user: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findUserPosts(
    id: number,
    query: BaseQueryParams,
    currentUserId?: number | null,
  ): Promise<PaginatedViewDto<PostOutputDto[] | null>> {
    const findUser = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!findUser) return null;

    if (currentUserId === null) {
      query.pageSize = Math.min(query.pageSize || 10, 8);
      query.pageNumber = Math.min(query.pageSize, 1);
    }

    const totalCount = await this.prisma.post.count({
      where: { status: 'public', isDeleted: false, userId: id },
    });

    const posts = await this.prisma.post.findMany({
      where: { status: 'public', isDeleted: false, userId: id },
      orderBy: { [query.sortBy]: query.sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
      include: {
        photos: { where: { isDeleted: false } },
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    return PaginatedViewDto.mapToView({
      items: posts.map((post) => this.mapToOutput(post)),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
    });
  }

  private mapToOutput(post: any): PostOutputDto {
    return {
      id: post.id.toString(),
      description: post.description ?? '',
      photos: post.photos.map((p) => p.photoUrl),
      userId: post.user.id.toString(),
      status: post.status === 'public',
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }
}
