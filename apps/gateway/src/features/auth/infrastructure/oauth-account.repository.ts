import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { OAuthAccount, ProviderType } from '@prisma/client';

@Injectable()
export class OAuthAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProviderTypeAndProviderId(
    provider: ProviderType,
    providerId: string,
  ): Promise<OAuthAccount | null> {
    const account = await this.prisma.oAuthAccount.findUnique({
      where: { provider_providerId: { provider, providerId } },
    });

    return account ? account : null;
  }

  async create(
    userId: number,
    provider: ProviderType,
    providerId: string,
    email: string,
  ): Promise<OAuthAccount> {
    return this.prisma.oAuthAccount.create({
      data: {
        userId: userId,
        provider: provider,
        providerId: providerId,
        email: email,
      },
    });
  }

  async updateOrCreate(
    userId: number,
    provider: ProviderType,
    providerId: string,
    email: string,
  ): Promise<OAuthAccount> {
    return this.prisma.oAuthAccount.upsert({
      where: { provider_providerId: { provider, providerId } },
      update: { email },
      create: {
        userId: userId,
        provider: provider,
        providerId: providerId,
        email: email,
      },
    });
  }

  async updateEmail(
    providerId: string,
    provider: ProviderType,
    email: string,
  ): Promise<OAuthAccount> {
    const account = await this.prisma.oAuthAccount.update({
      where: { provider_providerId: { provider, providerId } },
      data: { email: email },
    });

    return account;
  }
}
