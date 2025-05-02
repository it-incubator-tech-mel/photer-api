// @Controller('users')
// export class UserController {
//   constructor() {}
//   @Get('user/:id')
//   async getProfileUser(@Param(id) id: string) {
//     // const profileUser = ;
//   }
// }
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetUserCommand } from '../application/use-cases/User/get-user.use-case';
import { NotFoundException } from '../../../core/exception-filters/exceptions/exception-types';
import { OptionalJwtAuthGuard } from '../../../core/guards/soft.bearer-guard';
import { BaseQueryParams } from '../../../../base/dto/base.query-param';
import { GetUserPostCommand } from '../application/use-cases/User/get-user-posts.use-case';

@Controller('users')
export class UserController {
  constructor(private commandBus: CommandBus) {}
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id') id: number) {
    const profile = await this.commandBus.execute(new GetUserCommand(id));
    if (!profile) throw new NotFoundException();
    return profile;
  }
  @Get('/:id/posts')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserPosts(
    @Param('id') id: number,
    @Request() req: { user: { userId: number | null } },
    @Query() query: BaseQueryParams,
  ) {
    const profile = await this.commandBus.execute(
      new GetUserPostCommand(id, query, req.user.userId),
    );
    if (!profile) throw new NotFoundException();
    return profile;
  }
}
