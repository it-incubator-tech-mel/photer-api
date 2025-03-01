import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../domain/user.entity';
import {PasswordRecovery} from "../domain/password-recovery";


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
  async updateRecoveryCodeByEmailOrSave(
      passwordRecovery: PasswordRecovery
  ) {
    const findPasswordRecoveryByUserId = await this.prisma.passwordRecovery.findFirst({
      where: {
        userId: passwordRecovery.userId
      }})
    if (findPasswordRecoveryByUserId){
      await this.prisma.passwordRecovery.update({
        where: {userId: passwordRecovery.userId},
        data: {
          userId: passwordRecovery.userId,
          recoveryCode: passwordRecovery.recoveryCode,
          expirationDate: passwordRecovery.expirationDate,
        }
      })
    }else {
      await this.prisma.passwordRecovery.create({
        data: {
          userId: passwordRecovery.userId,
          recoveryCode: passwordRecovery.recoveryCode,
          expirationDate: passwordRecovery.expirationDate,
        }
      })
    }
  }

  async findByRecoveryCodeAndUpdateDate(
      newPassword: string,
      recoveryCode: string,
      date: Date
  ): Promise<boolean | null> {
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
    if (!prismaUser || prismaUser.passwordRecovery.expirationDate < date) return null
    await this.prisma.user.update({where: {id: prismaUser.id},
      data : {
      password: newPassword
      }})
    return true
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
    );
  }
}