import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Notification } from '../../../base/notification/notification';
import {
  BadRequestException,
  UnauthorizedException,
} from '../exception-filters/exceptions/exception-types';
import { AuthService } from '../../features/auth/application/services/auth-service';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../../features/auth/api/dto/input/login.dto';
import { validateOrReject } from 'class-validator';

/**
 * check login data (extracts data from body)
 */

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    // 1. We turn the data into a DTO and validate it
    const loginDto = plainToInstance(LoginDto, { email, password });

    try {
      await validateOrReject(loginDto, { stopAtFirstError: true });
    } catch (errors) {
      const firstError = errors[0];
      const constraints = firstError?.constraints;
      const message = constraints
        ? (Object.values(constraints)[0] as string)
        : 'Validation failed';
      throw new BadRequestException([{ field: firstError.property, message }]);
    }

    const result: Notification<number> = await this.authService.validateUser(
      email,
      password,
    );

    // 2. If valid, we check the user
    const userId: number = result.data;
    if (!userId) {
      throw new UnauthorizedException(result.errorMessage);
    }

    return { id: userId };
  }
}
