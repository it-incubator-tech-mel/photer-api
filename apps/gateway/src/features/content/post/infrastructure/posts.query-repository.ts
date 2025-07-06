import { Injectable } from '@nestjs/common';
import { PostOutputDto } from '../api/dto/output/post.output.dto';
import { BasePaginatedOutputDto } from '../../../../../base/dto/base-output-dto/base-paginated.output.dto';
import { BaseQueryParams } from '../../../../../base/dto/base-input-query-params/base.query-params';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PostQueryParams } from '../api/query/get-all-posts.query';

@Injectable()
export class PostQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    query: PostQueryParams,
  ): Promise<BasePaginatedOutputDto<PostOutputDto[]>> {
    const totalCount: number = await this.prisma.post.count();

    // post | []
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
            username: true,
            profile: {
              where: { isDeleted: false },
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    const mappedPosts: PostOutputDto[] = foundPosts.map((post) =>
      this.mapToOutput(post),
    );

    return BasePaginatedOutputDto.mapToOutput({
      items: mappedPosts,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
    });
  }

  async findById(id: number): Promise<PostOutputDto | null> {
    // post | null
    const foundPost = await this.prisma.post.findUnique({
      where: { id: id, status: 'public', isDeleted: false },
      include: {
        photos: { where: { isDeleted: false } },
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              where: { isDeleted: false },
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!foundPost) return null;

    return this.mapToOutput(foundPost);
  }

  async findUserPosts(
    userId: number,
    query: BaseQueryParams,
    currentUserId?: number | null,
  ): Promise<BasePaginatedOutputDto<PostOutputDto[] | null>> {
    const findUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!findUser) return null;

    if (currentUserId === null) {
      query.pageSize = Math.min(query.pageSize || 10, 8);
      query.pageNumber = Math.min(query.pageSize, 1);
    }

    const totalCount = await this.prisma.post.count({
      where: { status: 'public', isDeleted: false, userId: userId },
    });

    const posts = await this.prisma.post.findMany({
      where: { status: 'public', isDeleted: false, userId: userId },
      orderBy: { [query.sortBy]: query.sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
      include: {
        photos: { where: { isDeleted: false } },
        user: {
          select: {
            id: true,
            username: true,
            profile: {
              where: { isDeleted: false },
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return BasePaginatedOutputDto.mapToOutput({
      items: posts.map((post) => this.mapToOutput(post)),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
    });
  }

  private mapToOutput(post: any): PostOutputDto {
    return {
      id: post.id.toString(),
      description: post.description ?? null,
      photos: post.photos.map((p) => p.photoUrl),
      owner: {
        userId: post.user.id.toString(),
        userName: post.user.username,
        firstName: post.user.profile?.firstName ?? null,
        lastName: post.user.profile?.lastName ?? null,
        avatarUrl: post.user.profile?.avatarUrl ?? null,
      },
      status: post.status === 'public',
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }
}
