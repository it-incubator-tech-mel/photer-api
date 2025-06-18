import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Profile } from '../domain/profile.entity';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(profile: Profile): Promise<Profile> {
    // console.log('ProfileRepository save profile', profile);
    const savedProfile = await this.prisma.profile.upsert({
      where: { userId: profile.getUserId() },
      update: {
        firstName: profile.getFirstName(),
        lastName: profile.getLastName(),
        birthDate: profile.getBirthDate(),
        country: profile.getCountry(),
        city: profile.getCity(),
        aboutMe: profile.getAboutMe(),
        avatarUrl: profile.getAvatarUrl(),
        updatedAt: profile.getUpdatedAt(),
      },
      create: {
        // id: profile.getId(),
        userId: profile.getUserId(),
        firstName: profile.getFirstName(),
        lastName: profile.getLastName(),
        birthDate: profile.getBirthDate(),
        country: profile.getCountry(),
        city: profile.getCity(),
        aboutMe: profile.getAboutMe(),
        avatarUrl: profile.getAvatarUrl(),
        createdAt: profile.getCreatedAt(),
        updatedAt: profile.getUpdatedAt(),
      },
    });

    return this.mapToDomain(savedProfile);
  }

  // async create(profile: Profile): Promise<Profile> {
  //   const createdProfile = await this.prisma.profile.create({
  //     data: {
  //       userId: profile.getUserId(),
  //       firstName: profile.getFirstName(),
  //       lastName: profile.getLastName(),
  //       birthDate: profile.getBirthDate(),
  //       country: profile.getCountry(),
  //       city: profile.getCity(),
  //       aboutMe: profile.getAboutMe(),
  //       createdAt: profile.getCreatedAt(),
  //       updatedAt: profile.getUpdatedAt(),
  //     },
  //   });
  //
  //   return this.mapToDomain(createdProfile);
  // }

  async findById(id: number): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        id,
      },
    });

    return profile ? this.mapToDomain(profile) : null;
  }

  async findByUserId(userId: number): Promise<Profile | null> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId: userId,
      },
    });

    return profile ? this.mapToDomain(profile) : null;
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.profile.delete({
      where: { id },
    });
  }

  private mapToDomain(dbProfile: any): Profile {
    return Profile.restore(
      dbProfile.id,
      dbProfile.userId,
      dbProfile.firstName,
      dbProfile.lastName,
      dbProfile.createdAt,
      dbProfile.updatedAt,
      dbProfile.birthDate || undefined,
      dbProfile.country || undefined,
      dbProfile.city || undefined,
      dbProfile.aboutMe || undefined,
    );
  }
}
