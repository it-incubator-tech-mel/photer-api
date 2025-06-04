import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Profile } from '../domain/profile.entity';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(profile: Profile): Promise<void> {
    console.log('ProfileRepository save profile', profile);
    await this.prisma.profile.upsert({
      where: { userId: profile.getUserId() },
      update: {
        firstName: profile.getFirstName(),
        lastName: profile.getLastName(),
        birthDate: profile.getBirthDate(),
        country: profile.getCountry(),
        city: profile.getCity(),
        aboutMe: profile.getAboutMe(),
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
        createdAt: profile.getCreatedAt(),
        updatedAt: profile.getUpdatedAt(),
      },
    });
  }

  // async findByUserId(userId: number): Promise<Profile | null> {
  //   const profileData = await this.prisma.profile.findUnique({
  //     where: { userId },
  //   });
  //
  //   if (!profileData) return null;
  //
  //   return Profile.restore(
  //     profileData.id,
  //     profileData.userId,
  //     profileData.firstName,
  //     profileData.lastName,
  //     profileData.createdAt,
  //     profileData.updatedAt,
  //     profileData.birthDate || undefined,
  //     profileData.country || undefined,
  //     profileData.city || undefined,
  //     profileData.aboutMe || undefined,
  //   );
  // }
}
