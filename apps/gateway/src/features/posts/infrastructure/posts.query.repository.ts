import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PostOutputDto } from '../api/dto/output/post.output.dto';

@Injectable()
export class PostQueryRepository {
  constructor(private prisma: PrismaService) {}
  async getAll(): Promise<PostOutputDto[] | null> {
    const posts = await this.prisma.post.findMany({
      where: { status: 'public', isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        Photo: { where: { isDeleted: false } },
      },
    });

    return posts.map((post) => this.mapToOutput(post));
  }

  async findProfileUser(id: number): Promise<PostOutputDto[] | null> {
    const findUser = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!findUser) return null;
    const posts = await this.prisma.post.findMany({
      where: { status: 'public', isDeleted: false, userId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        Photo: { where: { isDeleted: false } },
      },
    });

    return posts.map((post) => this.mapToOutput(post));
  }

  private mapToOutput(post: any): PostOutputDto {
    return {
      id: post.id.toString(),
      description: post.description ?? '',
      photos: post.photo.map((p) => p.photoUrl),
      status: post.status === 'public',
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }
}
