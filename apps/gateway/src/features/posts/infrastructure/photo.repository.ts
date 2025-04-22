import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Photo } from '../domain/photo.entity';

@Injectable()
export class PhotoRepository {
  constructor(private prisma: PrismaService) {}

  async create(photo: Photo): Promise<void> {
    await this.prisma.photo.create({
      data: {
        photoUrl: photo.getPhotoUrl(),
        postId: photo.getPostId(),
        createdAt: photo.getCreatedAt(),
      },
    });
  }
}
