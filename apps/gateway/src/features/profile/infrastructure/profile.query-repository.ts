import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProfileOutputDto } from '../api/dto/output/profile.output.dto';

@Injectable()
export class ProfileQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<ProfileOutputDto> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!profile) return null;

    const username: string = profile.user.username;

    return this.mapToOutput(profile, username);
  }

  async findByUserId(userId: number): Promise<ProfileOutputDto> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!profile) return null;

    const username: string = profile.user.username;

    return this.mapToOutput(profile, username);
  }

  private mapToOutput(profile: any, username: string): ProfileOutputDto {
    return {
      id: profile.id.toString(),
      username: username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      city: profile.city ?? null,
      country: profile.country ?? null,
      birthDate: profile.birthDate ? profile.birthDate.toISOString() : null,
      aboutMe: profile.aboutMe ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }
}
