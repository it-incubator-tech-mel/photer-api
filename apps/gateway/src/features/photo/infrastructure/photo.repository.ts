import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Photo } from '../domain/photo.entity';

@Injectable()
export class PhotoRepository {
  constructor(private prisma: PrismaService) {}

  async create(photo: Photo): Promise<boolean> {
    try {
      const createdPhoto = await this.prisma.photo.create({
        data: {
          photoUrl: photo.getPhotoUrl(),
          postId: photo.getPostId(),
          createdAt: photo.getCreatedAt(),
        },
      });

      return !!createdPhoto;
    } catch (error) {
      return false;
    }
  }
}
