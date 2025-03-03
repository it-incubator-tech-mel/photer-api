import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { RefreshTokenPayload } from '../../../core/services/jwt/jwt-token.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    private prismaService: PrismaService,
  ) {
  }

  async update(parser: RefreshTokenPayload) {
    return this.prismaService.refreshToken.update({
      where: {
        userId: parser.userId,
        deviceId: +parser.deviceId,
      },
      data: {
        iat: parser.iat,
        exp: parser.exp,
      },
    });
  }
}