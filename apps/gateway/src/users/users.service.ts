import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * Сервис для работы с пользователями
 *
 * Минимальная реализация для поддержки auth функционала.
 * В дальнейшем будет расширен в соответствии с Production API.
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Поиск пользователя по email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Поиск пользователя по username
   */
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Поиск пользователя по коду подтверждения
   */
  async findByConfirmationCode(code: string) {
    return this.prisma.user.findFirst({
      where: { confirmationCode: code },
    });
  }

  /**
   * Поиск пользователя по коду восстановления
   */
  async findByRecoveryCode(code: string) {
    return this.prisma.user.findFirst({
      where: { recoveryCode: code },
    });
  }

  /**
   * Поиск пользователя по ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Создание нового пользователя
   */
  async create(userData: {
    username: string;
    email: string;
    password: string;
    confirmationCode?: string;
    confirmationExpires?: string | Date;
    oauthProvider?: string;
    oauthId?: string;
    emailConfirmed?: boolean;
  }) {
    // Проверяем уникальность email и username
    const existingUserByEmail = await this.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUserByUsername = await this.findByUsername(userData.username);
    if (existingUserByUsername) {
      throw new ConflictException('User with this username already exists');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Конвертируем строки дат в Date объекты
    const confirmationExpires = userData.confirmationExpires
      ? typeof userData.confirmationExpires === 'string'
        ? new Date(userData.confirmationExpires)
        : userData.confirmationExpires
      : undefined;

    return this.prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        confirmationCode: userData.confirmationCode,
        confirmationExpires,
        oauthProvider: userData.oauthProvider,
        oauthId: userData.oauthId,
        emailConfirmed: userData.emailConfirmed ?? false,
      },
    });
  }

  /**
   * Подтверждение email пользователя
   */
  async confirmEmail(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailConfirmed: true,
        confirmationCode: null,
        confirmationExpires: null,
      },
    });
  }

  /**
   * Обновление кода подтверждения
   */
  async updateConfirmationCode(
    userId: string,
    code: string,
    expires: string | Date,
  ) {
    // Конвертируем строку даты в Date объект
    const confirmationExpires =
      typeof expires === 'string' ? new Date(expires) : expires;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        confirmationCode: code,
        confirmationExpires,
      },
    });
  }

  /**
   * Установка кода восстановления
   */
  async setRecoveryCode(userId: string, code: string, expires: string | Date) {
    // Конвертируем строку даты в Date объект
    const recoveryExpires =
      typeof expires === 'string' ? new Date(expires) : expires;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        recoveryCode: code,
        recoveryExpires,
      },
    });
  }

  /**
   * Обновление пароля пользователя
   */
  async updatePassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        recoveryCode: null,
        recoveryExpires: null,
      },
    });
  }

  /**
   * Создание пользователя через OAuth
   */
  async createOAuthUser(profile: any, provider: string) {
    let user = await this.findByEmail(profile.email);

    if (!user) {
      user = await this.create({
        username: profile.username || `user_${Date.now()}`,
        email: profile.email,
        password: '', // OAuth пользователи не имеют пароля
        oauthProvider: provider,
        oauthId: profile.id,
        emailConfirmed: true, // OAuth пользователи уже подтверждены
      });
    }

    return user;
  }

  /**
   * Получение общего количества пользователей
   *
   * Возвращает общее количество зарегистрированных пользователей в системе
   */
  async getUsersCount(): Promise<number> {
    return this.prisma.user.count();
  }
}
