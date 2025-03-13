import { ProviderType } from '@prisma/client';

export class OAuthAccount {
  id: number;
  userId: number;
  provider: ProviderType;
  providerId: string;
  email: string;
  createdAt: Date;

  constructor(partial: Partial<OAuthAccount>) {
    Object.assign(this, partial);
  }
}
