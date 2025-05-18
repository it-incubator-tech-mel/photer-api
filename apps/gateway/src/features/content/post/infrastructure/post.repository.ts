import { Injectable } from '@nestjs/common';
import { Post, PostStatus } from '../domain/post.aggregate';
import { Photo } from '../domain/photo.entity';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}

  async save(post: Post): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // create or update post
      const dbPost = await tx.post.upsert({
        where: { id: post.getId() || -1 },
        create: this.toPersistence(post),
        update: this.toPersistence(post),
      });

      // delete old photo and create new
      await tx.photo.deleteMany({ where: { postId: dbPost.id } });

      await tx.photo.createMany({
        data: post.getPhotos().map((photo) => ({
          url: photo.getUrl(),
          postId: dbPost.id,
          createdAt: photo.getCreatedAt(),
          isDeleted: photo.getIsDeleted(),
        })),
      });
    });
  }

  async findById(id: number): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
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

  async softDelete(id: number): Promise<Post> {
    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: { isDeleted: true },
    });

    return this.mapToDomain(updatedPost);
  }

  private toPersistence(post: Post): any {
    return {
      id: post.getId(),
      description: post.getDescription(),
      userId: post.getUserId(),
      status: post.getStatus(),
      isDeleted: post.getIsDeleted(),
      createdAt: post.getCreatedAt(),
      updatedAt: post.getUpdatedAt(),
    };
  }

  private mapToDomain(dbPost: any): Post {
    return Post.restore({
      id: dbPost.id,
      description: dbPost.description,
      userId: dbPost.userId,
      photos: dbPost.photos.map((photo) =>
        Photo.restore({
          id: photo.id,
          url: photo.url,
          postId: photo.postId,
          createdAt: photo.createdAt,
          isDeleted: photo.isDeleted,
        }),
      ),
      createdAt: dbPost.createdAt,
      updatedAt: dbPost.updatedAt,
      status: dbPost.status as PostStatus,
      isDeleted: dbPost.isDeleted,
    });
  }

  // async create(post: Post): Promise<Post> {
  //   const createdPost = await this.prisma.post.create({
  //     data: {
  //       description: post.getDescription(),
  //       userId: post.getUserId(),
  //       createdAt: post.getCreatedAt(),
  //       updatedAt: post.getUpdatedAt(),
  //       photos: {
  //         create: post.getPhotos().map((photo: Photo) => ({
  //           photoUrl: photo.getPhotoUrl(),
  //           createdAt: photo.getCreatedAt(),
  //         })),
  //       },
  //     },
  //     include: {
  //       photos: true,
  //     },
  //   });
  //
  //   return this.mapToDomain(createdPost);
  // }

  // async save(post: Post): Promise<void> {
  //   await this.prisma.post.update({
  //     where: { id: post.getId() },
  //     data: {
  //       description: post.getDescription(),
  //       updatedAt: post.getUpdatedAt(),
  //     },
  //   });
  // }
}
