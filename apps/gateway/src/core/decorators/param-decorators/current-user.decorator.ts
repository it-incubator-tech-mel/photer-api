import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../features/user/domain/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) throw new Error('User not provided in request');
    return request.user as User;
  },
);
