// update-profile.use-case.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateProfileDto } from '../../api/dto/input/update-profile.input.dto';
import { ProfileRepository } from '../../infrastructure/profile.repository';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private prisma: PrismaService,
    private profileRepository: ProfileRepository,
  ) {}

  async execute(userId: number, dto: UpdateProfileDto) {
    // return this.prisma.$transaction(async (tx) => {
    //   // Обновляем username в User
    //   await tx.user.update({
    //     where: { id: userId },
    //     data: { username: dto.username },
    //   });
    //
    //   // Обновляем или создаем профиль
    //   return this.profileRepository.update(
    //     userId,
    //     {
    //       firstName: dto.firstName,
    //       lastName: dto.lastName,
    //       birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
    //       country: dto.country,
    //       city: dto.city,
    //       aboutMe: dto.aboutMe,
    //     },
    //     tx,
    //   );
    // });
  }
}
