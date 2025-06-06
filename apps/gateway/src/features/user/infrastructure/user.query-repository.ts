import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthMeOutputDto } from '../../auth/api/dto/output/auth-me.dto';
import { UserMapper } from './mappers/user.mpper';

export abstract class IUserQueryRepository {
  abstract findAuthenticatedUserById(id: number): Promise<AuthMeOutputDto>;
  abstract getCount(): Promise<number>;
}

@Injectable()
export class UserQueryRepository implements IUserQueryRepository {
  constructor(private prisma: PrismaService) {}

  async findAuthenticatedUserById(id: number): Promise<AuthMeOutputDto> {
    const result = await this.prisma.user.findFirst({
      where: { id },
    });

    return UserMapper.toAuthMeOutput(result);
  }

  async getCount(): Promise<number> {
    return this.prisma.user.count();
  }
}
