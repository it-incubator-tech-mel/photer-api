import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserEmail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user?.email) throw new Error('User email not provided in request');
    return request.user.email;
  },
);
