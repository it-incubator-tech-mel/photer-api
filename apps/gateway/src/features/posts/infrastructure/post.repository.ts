import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Post } from '@posts/domain/post.entity';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}
  async findAllPosts(): Promise<Post[] | null> {
    const foundPosts = await this.prisma.post.findMany({
      where: { status: 'public' },
      orderBy: { createdAt: 'desc' },
    });
    const mapAllPost = foundPosts.map((post) => this.mapToDomain(post));
    return foundPosts.length > 0 ? mapAllPost : null;
  }

  private mapToDomain(post: any): Post {
    return Post.restore(
      post.id,
      post.description,
      post.photo,
      post.userId,
      post.user,
      post.createdAt,
      post.updatedAt,
      post.isDeleted,
      post.status,
    );
  }
}
