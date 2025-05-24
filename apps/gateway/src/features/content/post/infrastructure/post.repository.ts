import { Injectable } from '@nestjs/common';
import { Post, PostStatus } from '../domain/post.aggregate';
import { Photo } from '../domain/photo.entity';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PostRepository {
  constructor(private prisma: PrismaService) {}

  async save(post: Post): Promise<Post> {
    return this.prisma.$transaction(async (tx) => {
      // If post is new (id = null или undefined)
      if (post.getId() === null || post.getId() === undefined) {
        const dbPost = await tx.post.create({
          data: this.toPersistence(post),
        });

        // save photo
        await tx.photo.createMany({
          data: post.getPhotos().map((photo) => ({
            photoUrl: photo.getPhotoUrl(),
            postId: dbPost.id,
            createdAt: photo.getCreatedAt(),
            isDeleted: photo.getIsDeleted(),
          })),
        });

        return Post.restore({
          ...post.getAllProps(),
          id: dbPost.id,
        });
      } else {
        // update
        await tx.post.update({
          where: { id: post.getId() },
          data: this.toPersistence(post),
        });

        // delete old photos and add new
        await tx.photo.deleteMany({ where: { postId: post.getId() } });
        await tx.photo.createMany({
          data: post.getPhotos().map((photo) => ({
            photoUrl: photo.getPhotoUrl(),
            postId: post.getId(),
            createdAt: photo.getCreatedAt(),
            isDeleted: photo.getIsDeleted(),
          })),
        });

        return post;
      }
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

  async softDelete(id: number): Promise<boolean> {
    try {
      const result: boolean = await this.prisma.$transaction(async (tx) => {
        const postUpdate = await tx.post.updateMany({
          where: {
            id,
            isDeleted: false,
          },
          data: { isDeleted: true },
        });

        if (postUpdate.count === 0) return false;

        await tx.photo.updateMany({
          where: { postId: id },
          data: { isDeleted: true },
        });

        return true;
      });

      return result;
    } catch (error) {
      return false;
    }
  }

  private toPersistence(post: Post): any {
    return {
      // Not include id, if it null/undefined
      ...(post.getId() && { id: post.getId() }),
      description: post.getDescription(),
      userId: post.getUserId(),
      status: post.getStatus(),
      isDeleted: post.getIsDeleted(),
    };
  }

  private mapToDomain(dbPost: any): Post {
    return Post.restore({
      id: dbPost.id,
      description: dbPost.description,
      userId: dbPost.userId,
      photos: dbPost.photos.map((photoData: any) =>
        Photo.restore({
          id: photoData.id,
          photoUrl: photoData.photoUrl,
          postId: photoData.postId,
          createdAt: photoData.createdAt,
          isDeleted: photoData.isDeleted,
        }),
      ),
      createdAt: dbPost.createdAt,
      updatedAt: dbPost.updatedAt,
      status: dbPost.status as PostStatus,
      isDeleted: dbPost.isDeleted,
    });
  }
}
