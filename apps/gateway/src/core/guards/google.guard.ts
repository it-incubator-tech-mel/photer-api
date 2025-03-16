import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activate = (await super.canActivate(context)) as boolean; // execute GoogleStrategy
    // console.log("activate", activate);
    const request = context.switchToHttp().getRequest();
    // await super.logIn(request);
    return activate;
  }
}

// @Injectable()
// export class GoogleGuard extends AuthGuard('google') {
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     //console.log("in GoogleGuard");
//
//     const request = context.switchToHttp().getRequest();
//     //console.log("request.query", request.query);
//     // if (request.query.code) {
//     //   console.log("Callback from Google detected");
//     // } else {
//     //   console.log("Redirecting to Google for login");
//     // }
//
//     const activate = (await super.canActivate(context)) as boolean; // execute GoogleStrategy
//
//     // await super.logIn(request);
//     return activate;
//   }
// }