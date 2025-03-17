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