import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OAuthGuardFactory } from './oauth-guard.factory';
import { IAuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '../../exception-filters/exceptions/exception-types';

@Injectable()
export class OAuthLoginGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const provider: string = request.params.provider?.toLowerCase();

    if (!['google', 'github'].includes(provider?.toLowerCase())) {
      throw new UnauthorizedException(
        `Unsupported OAuth provider: ${provider}`,
      );
    }

    const GuardClass: Type<IAuthGuard> = OAuthGuardFactory(
      provider as 'google' | 'github',
    );
    return (await new GuardClass().canActivate(context)) as boolean;
  }
}
