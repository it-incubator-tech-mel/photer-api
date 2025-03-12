import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProviderType } from '@prisma/client';
import { OAuthAccount } from '../domain/oauth-account.entity';

@Injectable()
export class OAuthAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number): Promise<OAuthAccount | null> {
    const account = await this.prisma.oAuthAccount.findFirst({
      where: { userId },
    });
    return account ? this.mapToDomain(account) : null;
  }

  async findByProviderAndProviderId(provider: ProviderType, providerId: string): Promise<OAuthAccount | null> {
    const account = await this.prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider, providerId } },
    });
    return account ? this.mapToDomain(account) : null;
  }

  async create(data: { userId: number; provider: ProviderType; providerId: string; email: string }): Promise<OAuthAccount> {
    const account = await this.prisma.oAuthAccount.create({
      data,
    });
    return this.mapToDomain(account);
  }

  private mapToDomain(prismaAccount: any): OAuthAccount {
    return new OAuthAccount(prismaAccount)
  }
}
