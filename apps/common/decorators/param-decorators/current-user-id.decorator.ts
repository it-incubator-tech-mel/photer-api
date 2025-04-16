import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (request.user.data) {
      request.user.id = request.user.data.id;
    }
    if (!request.user?.id) throw new Error('User id not provided in request');
    return request.user.id;
  },
);

// export const CurrentUserId = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext) => {
//     const request = ctx.switchToHttp().getRequest();
//     console.log('request user', request.user);
//     if (!request.user?.data.id)
//       throw new Error('User id not provided in request');
//     return request.user.id;
//   },
// );
