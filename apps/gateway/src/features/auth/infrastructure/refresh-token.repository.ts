import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenPayload } from '../../../core/services/jwt/jwt-token.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private configService: ConfigService<any, true>,
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

  async delete(refreshToken: string): Promise<any> {
    const parser = await this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    return this.prismaService.refreshToken.delete({
      where: {
        userId: +parser.userId,
        deviceId: +parser.deviceId,
        iat: +parser.iat,
      },
    });
  }
}