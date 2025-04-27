import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Post } from '../domain/post.entity';
import { Photo } from '../domain/photo.entity';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}

  async save(post: Post): Promise<void> {
    await this.prisma.post.update({
      where: { id: post.getId() },
      data: {
        description: post.getDescription(),
        updatedAt: post.getUpdatedAt(),
      },
    });
  }

  async findById(id: number): Promise<Post | null> {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        photos: true,
      },
    });

    return post ? this.mapToDomain(post) : null;
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Post | null> {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
      include: {
        photos: true,
      },
    });

    return post ? this.mapToDomain(post) : null;
  }

  async create(post: Post): Promise<Post> {
    const createdPost = await this.prisma.post.create({
      data: {
        description: post.getDescription(),
        userId: post.getUserId(),
        createdAt: post.getCreatedAt(),
        updatedAt: post.getUpdatedAt(),
        photos: {
          create: post.getPhotos().map((photo: Photo) => ({
            photoUrl: photo.getPhotoUrl(),
            createdAt: photo.getCreatedAt(),
          })),
        },
      },
      include: {
        photos: true,
      },
    });

    return this.mapToDomain(createdPost);
  }

  async softDelete(id: number, userId: number): Promise<Post> {
    const updatedPost = await this.prisma.post.update({
      where: { id, userId },
      data: { isDeleted: true },
      include: {
        photos: true,
      },
    });

    return this.mapToDomain(updatedPost);
  }

  private mapToDomain(raw: any): Post {
    return Post.restore(
      raw.id,
      raw.description,
      raw.userId,
      raw.photos.map((photo) => ({
        id: photo.id,
        photoUrl: photo.photoUrl,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
        isDeleted: photo.isDeleted,
      })),
      raw.createdAt,
      raw.updatedAt,
      raw.status,
      raw.isDeleted,
    );
  }
}
