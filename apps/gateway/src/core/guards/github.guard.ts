import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GitHubGuard extends AuthGuard('github') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activate: boolean = (await super.canActivate(context)) as boolean; // execute GitHubStrategy
    return activate;
  }
}