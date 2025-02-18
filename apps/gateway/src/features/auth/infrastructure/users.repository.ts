import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../domain/user.entity';
import { UserType } from '../api/dto/User-type';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {
  }

  async save(user: User): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.getEmail() },
    });

    if (existingUser) {
      // If user exists, update it
      await this.prisma.user.update({
        where: { email: user.getEmail() },
        data: {
          username: user.getUsername(),
          password: user.getPassword(),
          isDeleted: user.getIsDeleted(),
          updatedAt: new Date(),
        },
      });

      // Update email confirmation (if necessary)
      await this.prisma.emailConfirmation.upsert({
        where: { userId: existingUser.id },
        update: {
          confirmationCode: user.getConfirmationCode(),
          expirationDate: user.getConfirmationExpiration(),
          isConfirmed: user.isEmailConfirmed(), // или оставьте как есть, если не подтверждено
        },
        create: {
          userId: existingUser.id,
          confirmationCode: user.getConfirmationCode(),
          expirationDate: user.getConfirmationExpiration(),
          isConfirmed: false, // начальное состояние
        },
      });
    } else {
      // Create user if does not exist
      const createdUser = await this.prisma.user.create({
        data: {
          username: user.getUsername(),
          password: user.getPassword(),
          email: user.getEmail(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
      });

      // Create confirmation email record
      await this.prisma.emailConfirmation.create({
        data: {
          userId: createdUser.id,
          confirmationCode: user.getConfirmationCode(),
          expirationDate: user.getConfirmationExpiration(),
          isConfirmed: false, // начальное состояние
        },
      });
    }
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

  // async findById(id: number): Promise<UserType>{
  //   return prisma.user.findUnique({
  //     where: {
  //       id
  //     }
  //   })
  //
  // }
  // async createUser(username: string,email: string, passwordHash: string): Promise<UserType>{
  //   return prisma.user.findUnique({
  //     where: {
  //       email
  //     }
  //   })
  // }

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