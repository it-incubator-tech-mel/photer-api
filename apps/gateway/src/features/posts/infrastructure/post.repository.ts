import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Post } from '../domain/post.entity';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}

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
      updatedAt: photo.updatedAt,
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
