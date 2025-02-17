import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../domain/user.entity';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        username: user.getUsername(),
        password: user.getPassword(),
        email: user.getEmail(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        emailConfirmation: {
          create: {
            confirmationCode: user.getConfirmationCode(),
            expirationDate: user.getConfirmationExpiration(),
            isConfirmed: false,
          },
        },
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { username },
      include: { emailConfirmation: true },
    });

    return user ? this.mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { emailConfirmation: true },
    });
    return user ? this.mapToDomain(user) : null;
  }

  private mapToDomain(prismaUser: any): User {
    return User.restore(
      prismaUser.id,
      prismaUser.username,
      prismaUser.password,
      prismaUser.email,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.isDeleted,
      prismaUser.emailConfirmation?.confirmationCode ?? '',
      prismaUser.emailConfirmation?.expirationDate ?? new Date(),
      prismaUser.emailConfirmation?.isConfirmed ?? false,
    );
  }
}