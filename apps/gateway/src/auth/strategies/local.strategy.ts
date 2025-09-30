import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log(`🔍 LocalStrategy.validate called for email: ${email}`);

    try {
      console.log(`🔄 Calling authService.validateUser...`);
      const user = await this.authService.validateUser(email, password);
      console.log(`👤 User returned from validateUser: ${user ? 'Yes' : 'No'}`);

      if (!user) {
        console.log(`❌ No user returned, throwing UnauthorizedException`);
        throw new UnauthorizedException({
          message: 'Invalid email or password',
        });
      }

      console.log(
        `✅ User validation successful, returning user: ${user.username}`,
      );
      return user;
    } catch (error) {
      console.log(`❌ Error in LocalStrategy.validate:`, error);

      // Если это уже UnauthorizedException с сообщением, пробрасываем как есть
      if (error instanceof UnauthorizedException) {
        console.log(
          `🔄 Re-throwing UnauthorizedException with message: ${error.message}`,
        );
        throw error;
      }

      // Иначе создаем общую ошибку аутентификации
      console.log(`🔄 Creating generic UnauthorizedException`);
      throw new UnauthorizedException({
        message: 'Authentication failed',
      });
    }
  }
}
