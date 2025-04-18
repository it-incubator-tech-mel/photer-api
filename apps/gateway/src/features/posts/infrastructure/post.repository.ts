import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Post } from '../domain/post.entity';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}
  async findAllPosts(): Promise<Post[] | null> {
    const foundPosts = await this.prisma.post.findMany({
      where: { status: 'public', isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        photo: { where: { isDeleted: false } },
      },
    });
    const mapAllPost = foundPosts.map((post) => this.mapToDomain(post));
    return foundPosts.length > 0 ? mapAllPost : null;
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
