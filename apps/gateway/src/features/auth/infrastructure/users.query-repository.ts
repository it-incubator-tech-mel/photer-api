import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthMeOutputDto } from '../api/dto/output/auth-me.dto';
import { UserMapper } from './mappers/user.mpper';

@Injectable()
export class UserQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findAuthenticatedUserById(id: number): Promise<AuthMeOutputDto> {
    const result = await this.prisma.user.findFirst({
      where: { id },
    });

    return UserMapper.toAuthMeOutput(result);
  }
}
