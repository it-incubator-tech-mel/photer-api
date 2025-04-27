import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Post } from '../domain/post.entity';
import { BaseQueryParams } from '../../../../base/dto/base.query-param';
import { OutputPostType } from '../api/dto/output/Output.post.type';
import { PaginatedViewDto } from '../../../../base/dto/base.paginated.view-dto';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}
  async findAllPosts(
    query: BaseQueryParams,
  ): Promise<PaginatedViewDto<OutputPostType[] | null>> {
    const totalCount = await this.prisma.post.count();
    const foundPosts = await this.prisma.post.findMany({
      where: { status: 'public', isDeleted: false },
      orderBy: { [query.sortBy]: query.sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
      include: {
        photo: { where: { isDeleted: false } },
      },
    });
    const mappedToPosts = foundPosts.map((post) => this.mapToDomain(post));
    const mappedToOutputPostType = mappedToPosts.map((post) =>
      Post.getViewModel(post),
    );
    return PaginatedViewDto.mapToView({
      items: mappedToOutputPostType,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
    });
  }
  async findProfileUser(id: number): Promise<Post[] | null> {
    const findUser = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!findUser) return null;
    const foundPosts = await this.prisma.post.findMany({
      where: { status: 'public', isDeleted: false, userId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        photo: { where: { isDeleted: false } },
      },
    });
    const mapAllPost = foundPosts.map((post) => this.mapToDomain(post));
    return foundPosts.length > 0 ? mapAllPost : [];
  }

  async createOnePost(post: Post) {
    return this.prisma.post.create({
      data: {
        description: post.getDescription(),
        // photo: post.getPhoto(),
        userId: post.getUserId(),
        createdAt: post.getCreatedAt(),
        updatedAt: post.getUpdatedAt(),
      },
    });
  }

  private mapToDomain(post: any): Post {
    const photo = post.photo.map((photo: any) => ({
      id: photo.id,
      photoUrl: photo.photoUrl,
      createdAt: photo.createdAt,
    }));
    return Post.restore(
      post.id,
      post.description,
      post.userId,
      photo,
      post.createdAt,
      post.updatedAt,
      post.status,
      post.isDeleted,
    );
  }
}
