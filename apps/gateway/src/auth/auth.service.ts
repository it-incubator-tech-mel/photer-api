import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import { RegistrationDto } from './dto/registration.dto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Сервис для аутентификации и регистрации пользователей
 *
 * Этот сервис содержит всю бизнес-логику для:
 * - Регистрации новых пользователей
 * - Подтверждения email
 * - Входа в систему
 * - OAuth аутентификации
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // Преобразует TTL вида '120000', '60s', '2m', '1h', '7d' в секунды для jwt "expiresIn"
  private parseTtlToSeconds(
    value: string | undefined,
    defaultValue: string,
  ): number | string {
    const src = (value || defaultValue).toString().trim();
    // Если указаны единицы, передаём строку как есть — jsonwebtoken понимает
    if (/^\d+(ms|s|m|h|d)$/i.test(src)) return src.toLowerCase();
    // Иначе интерпретируем как миллисекунды/секунды и приводим к сек.
    const match = src.match(/^(\d+)$/);
    if (match) {
      const num = Number(match[1]);
      // Если похоже на миллисекунды (больше часа в секундах), переведём в сек
      if (num > 24 * 60 * 60) {
        return Math.floor(num / 1000);
      }
      return num; // считаем секундами
    }
    // Фолбэк: 5 минут
    return '5m';
  }

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.log(`🔍 validateUser called for email: ${email}`);

    const user = await this.usersService.findByEmail(email);
    this.logger.log(`👤 User found: ${user ? 'Yes' : 'No'}`);

    if (user) {
      this.logger.log(`📧 User email: ${user.email}`);
      this.logger.log(`✅ Email confirmed: ${user.emailConfirmed}`);
      this.logger.log(`🆔 User ID: ${user.id}`);
      this.logger.log(`👤 Username: ${user.username}`);

      const passwordMatch = await bcrypt.compare(password, user.password);
      this.logger.log(`🔐 Password match: ${passwordMatch}`);

      if (passwordMatch) {
        // Проверяем, подтвержден ли email
        if (!user.emailConfirmed) {
          this.logger.warn(`❌ Email not confirmed for user: ${email}`);
          throw new UnauthorizedException({
            message:
              'Email not confirmed. Please check your email and confirm your account.',
          });
        }

        this.logger.log(`✅ User validation successful for: ${email}`);
        const { password, ...result } = user;
        return result;
      } else {
        this.logger.warn(`❌ Password mismatch for user: ${email}`);
      }
    } else {
      this.logger.warn(`❌ User not found for email: ${email}`);
    }

    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };

    // Генерируем access token (секрет: JWT_SECRET)
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: this.parseTtlToSeconds(
        process.env.JWT_ACCESS_EXPIRATION_TIME,
        '5m',
      ),
    });

    // Генерируем refresh token (секрет: JWT_REFRESH_SECRET || JWT_SECRET)
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: this.parseTtlToSeconds(
        process.env.JWT_REFRESH_EXPIRATION_TIME,
        '7d',
      ),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  /**
   * Регистрация нового пользователя
   *
   * Процесс регистрации включает:
   * 1. Проверку уникальности email и username
   * 2. Хеширование пароля
   * 3. Генерацию кода подтверждения
   * 4. Создание пользователя в базе данных
   * 5. Отправку email с кодом подтверждения
   *
   * @param registrationDto - данные для регистрации
   * @returns null (204 No Content)
   * @throws ConflictException если пользователь уже существует
   */
  async registration(registrationDto: RegistrationDto) {
    const { username, email, password } = registrationDto;

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException({
        errorsMessages: [
          {
            message: 'User with such credentials already exists',
            field: 'email',
          },
        ],
      });
    }

    // Проверяем, не существует ли уже пользователь с таким username
    const existingUserByUsername =
      await this.usersService.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException({
        errorsMessages: [
          {
            message: 'User with such credentials already exists',
            field: 'username',
          },
        ],
      });
    }

    // Генерируем уникальный код подтверждения (UUID v4)
    const confirmationCode = uuidv4();
    // Код действителен 24 часа
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 🔍 ОТЛАДОЧНЫЕ ЛОГИ
    this.logger.log(
      `🔑 Generated confirmation code for ${email}: ${confirmationCode}`,
    );
    this.logger.log(
      `⏰ Confirmation expires at: ${confirmationExpires.toISOString()}`,
    );

    // Создаем пользователя с кодом подтверждения
    // Пароль будет хеширован в UsersService.create()
    await this.usersService.create({
      username,
      email,
      password: password, // Передаем нехешированный пароль
      confirmationCode,
      confirmationExpires,
      emailConfirmed: false,
    });

    // Отправляем email с кодом подтверждения
    try {
      const emailSent = await this.emailService.sendRegistrationConfirmation(
        email,
        username,
        confirmationCode,
      );

      if (emailSent) {
        this.logger.log(`Registration confirmation email sent to ${email}`);
      } else {
        this.logger.warn(
          `Failed to send registration confirmation email to ${email}`,
        );
        // Не прерываем регистрацию, если email не отправлен
        // Пользователь может использовать код из логов для тестирования
        console.log(`Confirmation code for ${email}: ${confirmationCode}`);
      }
    } catch (error) {
      this.logger.error(
        `Error sending registration confirmation email to ${email}:`,
        error,
      );
      // Не прерываем регистрацию, если email не отправлен
      console.log(`Confirmation code for ${email}: ${confirmationCode}`);
    }

    return null; // Возвращаем 204 No Content согласно спецификации
  }

  /**
   * Подтверждение регистрации по коду
   *
   * Проверяет код подтверждения и активирует аккаунт пользователя.
   *
   * @param code - код подтверждения из email
   * @returns null (204 No Content)
   * @throws BadRequestException если код некорректен или истек
   */
  async registrationConfirmation(code: string) {
    this.logger.log(`🔍 registrationConfirmation called with code: ${code}`);
    this.logger.log(`🔍 Code length: ${code.length}`);
    this.logger.log(`🔍 Code type: ${typeof code}`);
    this.logger.log(`🔍 Code trimmed: "${code.trim()}"`);

    // Ищем пользователя по коду подтверждения
    const user = await this.usersService.findByConfirmationCode(code);
    this.logger.log(
      `👤 User found by confirmation code: ${user ? 'Yes' : 'No'}`,
    );

    if (user) {
      this.logger.log(
        `👤 User confirmation code in DB: ${user.confirmationCode}`,
      );
      this.logger.log(`🔍 Codes match: ${user.confirmationCode === code}`);
    }

    if (!user) {
      this.logger.warn(`❌ No user found for confirmation code: ${code}`);
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'UUID not correct',
            field: 'code',
          },
        ],
      });
    }

    this.logger.log(`👤 Found user: ${user.username} (${user.email})`);
    this.logger.log(
      `✅ Current email confirmed status: ${user.emailConfirmed}`,
    );

    // Проверяем, не подтвержден ли уже email
    if (user.emailConfirmed) {
      this.logger.warn(`⚠️ Email already confirmed for user: ${user.email}`);
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Email already confirmed',
            field: 'code',
          },
        ],
      });
    }

    // Проверяем, не истек ли код подтверждения
    if (user.confirmationExpires < new Date()) {
      this.logger.warn(`❌ Confirmation code expired for user: ${user.email}`);
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Confirmation code expired',
            field: 'code',
          },
        ],
      });
    }

    this.logger.log(
      `⏰ Confirmation code expires: ${user.confirmationExpires}`,
    );
    this.logger.log(`⏰ Current time: ${new Date()}`);
    this.logger.log(`✅ Code is still valid`);

    // Подтверждаем email пользователя
    this.logger.log(`🔄 Confirming email for user: ${user.email}`);
    await this.usersService.confirmEmail(user.id);
    this.logger.log(`✅ Email confirmed successfully for user: ${user.email}`);

    return null; // Возвращаем 204 No Content согласно спецификации
  }

  /**
   * Повторная отправка email подтверждения
   *
   * Генерирует новый код подтверждения и отправляет email
   * для пользователей, которые еще не подтвердили свой аккаунт.
   *
   * @param email - email адрес пользователя
   * @returns null (204 No Content)
   * @throws BadRequestException если пользователь не найден или уже подтвержден
   */
  async registrationEmailResending(email: string) {
    // Ищем пользователя по email
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'User not found',
            field: 'email',
          },
        ],
      });
    }

    // Проверяем, не подтвержден ли уже email
    if (user.emailConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Email already confirmed',
            field: 'email',
          },
        ],
      });
    }

    // Генерируем новый код подтверждения
    const confirmationCode = uuidv4();
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Обновляем код подтверждения у пользователя
    await this.usersService.updateConfirmationCode(
      user.id,
      confirmationCode,
      confirmationExpires,
    );

    // Отправляем новый email с кодом подтверждения
    try {
      const emailSent = await this.emailService.sendRegistrationConfirmation(
        email,
        user.username,
        confirmationCode,
      );

      if (emailSent) {
        this.logger.log(`New registration confirmation email sent to ${email}`);
      } else {
        this.logger.warn(
          `Failed to send new registration confirmation email to ${email}`,
        );
        // Не прерываем процесс, если email не отправлен
        console.log(`New confirmation code for ${email}: ${confirmationCode}`);
      }
    } catch (error) {
      this.logger.error(
        `Error sending new registration confirmation email to ${email}:`,
        error,
      );
      // Не прерываем процесс, если email не отправлен
      console.log(`New confirmation code for ${email}: ${confirmationCode}`);
    }

    return null; // Возвращаем 204 No Content согласно спецификации
  }

  async validateOAuthUser(profile: any, provider: string) {
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        username: profile.displayName || profile.username,
        password: '', // OAuth пользователи не имеют пароля
        oauthProvider: provider,
        oauthId: profile.id,
        emailConfirmed: true, // OAuth пользователи уже подтверждены
      });
    }

    return this.login(user);
  }

  /**
   * Восстановление пароля
   *
   * Генерирует код восстановления и отправляет email.
   * Включает проверку reCAPTCHA для предотвращения спама.
   *
   * @param email - email пользователя
   * @param recaptchaValue - значение reCAPTCHA
   * @returns null (204 No Content)
   * @throws BadRequestException если пользователь не найден или некорректная CAPTCHA
   */
  async passwordRecovery(email: string, recaptchaValue: string) {
    // TODO: Проверить reCAPTCHA
    // Пока просто проверяем, что значение не пустое
    if (!recaptchaValue || recaptchaValue.trim().length === 0) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Incorrect captcha',
            field: 'Captcha',
          },
        ],
      });
    }

    // Ищем пользователя по email
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'User not found',
            field: 'email',
          },
        ],
      });
    }

    // Генерируем код восстановления
    const recoveryCode = uuidv4();
    const recoveryExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    // Сохраняем код восстановления
    await this.usersService.setRecoveryCode(
      user.id,
      recoveryCode,
      recoveryExpires,
    );

    // Отправляем email с кодом восстановления
    try {
      const emailSent = await this.emailService.sendPasswordRecovery(
        email,
        user.username,
        recoveryCode,
      );

      if (emailSent) {
        this.logger.log(`Password recovery email sent to ${email}`);
      } else {
        this.logger.warn(`Failed to send password recovery email to ${email}`);
        // Не прерываем процесс, если email не отправлен
        console.log(`Password recovery code for ${email}: ${recoveryCode}`);
      }
    } catch (error) {
      this.logger.error(
        `Error sending password recovery email to ${email}:`,
        error,
      );
      // Не прерываем процесс, если email не отправлен
      console.log(`Password recovery code for ${email}: ${recoveryCode}`);
    }

    return null; // 204 No Content
  }

  /**
   * Повторная отправка восстановления пароля
   *
   * Генерирует новый код восстановления если предыдущий истек
   * или пользователь не получил email.
   *
   * @param email - email пользователя
   * @returns null (204 No Content)
   * @throws BadRequestException если пользователь не найден
   */
  async passwordRecoveryResending(email: string) {
    // Ищем пользователя по email
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'User not found',
            field: 'email',
          },
        ],
      });
    }

    // Генерируем новый код восстановления
    const recoveryCode = uuidv4();
    const recoveryExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    // Обновляем код восстановления
    await this.usersService.setRecoveryCode(
      user.id,
      recoveryCode,
      recoveryExpires,
    );

    // Отправляем новый email с кодом восстановления
    try {
      const emailSent = await this.emailService.sendPasswordRecovery(
        email,
        user.username,
        recoveryCode,
      );

      if (emailSent) {
        this.logger.log(`New password recovery email sent to ${email}`);
      } else {
        this.logger.warn(
          `Failed to send new password recovery email to ${email}`,
        );
        // Не прерываем процесс, если email не отправлен
        console.log(`New password recovery code for ${email}: ${recoveryCode}`);
      }
    } catch (error) {
      this.logger.error(
        `Error sending new password recovery email to ${email}:`,
        error,
      );
      // Не прерываем процесс, если email не отправлен
      console.log(`New password recovery code for ${email}: ${recoveryCode}`);
    }

    return null; // 204 No Content
  }

  /**
   * Установка нового пароля
   *
   * Проверяет код восстановления и устанавливает новый пароль.
   *
   * @param newPassword - новый пароль
   * @param recoveryCode - код восстановления из email
   * @returns null (204 No Content)
   * @throws BadRequestException если код некорректен или истек
   */
  async setNewPassword(newPassword: string, recoveryCode: string) {
    // Ищем пользователя по коду восстановления
    const user = await this.usersService.findByRecoveryCode(recoveryCode);

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'UUID not correct',
            field: 'recoveryCode',
          },
        ],
      });
    }

    // Проверяем, не истек ли код восстановления
    if (user.recoveryExpires < new Date()) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Recovery code expired',
            field: 'recoveryCode',
          },
        ],
      });
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль и очищаем код восстановления
    await this.usersService.updatePassword(user.id, hashedPassword);

    return null; // 204 No Content
  }

  /**
   * Получение информации о текущем пользователе
   *
   * Возвращает базовую информацию о пользователе по JWT токену.
   *
   * @param userId - ID пользователя из JWT токена
   * @returns информация о пользователе
   * @throws BadRequestException если пользователь не найден
   */
  async getCurrentUser(userId: string) {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'User not found',
            field: 'userId',
          },
        ],
      });
    }

    return {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
  }

  /**
   * Обновление refresh токена
   *
   * Проверяет refresh токен и генерирует новую пару токенов.
   *
   * @param refreshToken - refresh токен из cookie
   * @returns новые access и refresh токены
   * @throws UnauthorizedException если токен некорректен
   */
  async refreshTokens(refreshToken: string) {
    try {
      // Проверяем refresh токен
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      // Ищем пользователя
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Генерируем новые токены (скользящая сессия)
      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Выход из системы
   *
   * Аннулирует refresh токен (в данной реализации просто
   * возвращает 204, токен удаляется на клиенте).
   *
   * @returns null (204 No Content)
   */
  async logout() {
    // В данной реализации просто возвращаем 204
    // Токен должен быть удален на клиенте
    // В production можно добавить blacklist для токенов
    return null; // 204 No Content
  }
}
