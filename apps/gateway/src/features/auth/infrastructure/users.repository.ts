import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../domain/user.entity';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        username: user.getUsername(),
        password: user.getPassword(),
        email: user.getEmail(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
        isDeleted: user.getIsDeleted(),
        emailConfirmation: {
          create: {
            confirmationCode: user.getConfirmationCode(),
            expirationDate: user.getConfirmationExpiration(),
            isConfirmed: user.isEmailConfirmed(),
          },
        },
      },
      include: {
        emailConfirmation: true,
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

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { emailConfirmation: true },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async findByConfirmationCode(
    confirmationCode: string,
  ): Promise<User | null> {
    const prismaUser = await this.prisma.user.findFirst({
      where: {
        emailConfirmation: {
          confirmationCode: confirmationCode,
        },
      },
      include: {
        emailConfirmation: true,
      },
    });

    return prismaUser ? this.mapToDomain(prismaUser) : null;
  }

  async updateOrCreatePasswordRecovery(user: User): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.getId() },
        data: {
          updatedAt: user.getUpdatedAt(),
          password: user.getPassword()
        },
      }),
      this.prisma.passwordRecovery.upsert({
        where: { userId: user.getId() },
        update: {
          recoveryCode: user.getRecoveryCode() || "",
          expirationDate: user.getConfirmationExpiration(),
        },
        create: {
          recoveryCode: user.getRecoveryCode() || "",
          expirationDate: user.getConfirmationExpiration(),
          user: {
            connect: { id: user.getId() },
          },
        },
      }),
    ]);
  }

  async findUserByRecoveryCode(recoveryCode: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findFirst({
      where: {
        passwordRecovery: {
          recoveryCode
        },
      },
      include: {
        passwordRecovery: true,
      },
    });

    return prismaUser ? this.mapToDomain(prismaUser) : null;
  }

  async updateConfirmation(user: User): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.getId() },
        data: {
          updatedAt: user.getUpdatedAt(),
        },
      }),
      this.prisma.emailConfirmation.update({
        where: { userId: user.getId() },
        data: {
          confirmationCode: user.getConfirmationCode(),
          expirationDate: user.getConfirmationExpiration(),
          isConfirmed: user.isEmailConfirmed(),
        },
      }),
    ]);
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
      prismaUser.passwordRecovery?.recoveryCode,
      prismaUser.passwordRecovery?.expirationDate,
    );
  }
}
