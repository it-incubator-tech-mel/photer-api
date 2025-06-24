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

  private mapToOutput(profile: any, username: string): ProfileOutputDto {
    return {
      id: profile.id.toString(),
      username: username,
      firstName: profile.firstName,
      lastName: profile.lastName,
      city: profile.city ?? null,
      country: profile.country ?? null,
      region: profile.region ?? null,
      birthDate: profile.birthDate ? profile.birthDate.toISOString() : null,
      aboutMe: profile.aboutMe ?? null,
      // avatars: this.getProfileAvatars(profile),
      avatarUrl: profile.avatarUrl ?? null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  private getProfileAvatars(profile: any): string[] {
    if (!profile.avatars || !Array.isArray(profile.avatars)) {
      return [];
    }

    // Преобразуем в массив URL
    return profile.avatars.map((avatar) => {
      return typeof avatar === 'string'
        ? avatar
        : avatar?.url
          ? avatar.url
          : 'https://default-avatar-url.com/default.jpg';
    });
  }

  // private mapToOutput(profile: any, username: string): ProfileOutputDto {
  //   return {
  //     id: profile.id.toString(),
  //     username: username,
  //     firstName: profile.firstName,
  //     lastName: profile.lastName,
  //     city: profile.city ?? '',
  //     country: profile.country ?? '',
  //     region: profile.region ?? '',
  //     dateOfBirth: profile.dateOfBirth.toISOString(),
  //     aboutMe: profile.aboutMe ?? '',
  //     // avatars: profile.avatars.map((p) => p.avatars),
  //     avatars: ['https://example.com/avatar1.jpg'],
  //     createdAt: profile.createdAt.toISOString(),
  //     updatedAt: profile.updatedAt.toISOString(),
  //   };
  // }
}
