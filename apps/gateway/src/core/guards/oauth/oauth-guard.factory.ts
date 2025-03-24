import { Injectable, ExecutionContext, Type } from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from '../../exception-filters/exceptions/exception-types';

export function OAuthGuardFactory(
  provider: 'google' | 'github',
): Type<IAuthGuard> {
  if (!['google', 'github'].includes(provider)) {
    throw new UnauthorizedException('Unsupported OAuth provider');
  }

  @Injectable()
  class DynamicOAuthGuard extends AuthGuard(provider) {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      return (await super.canActivate(context)) as boolean;
    }
  }

  return DynamicOAuthGuard;
}
