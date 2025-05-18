/*
import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetUserCommand } from '../../post/aplication/use-case/User/get-user.use-case';
import { NotFoundException } from '../../../core/exception-filters/exceptions/exception-types';

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

  // @Get('profile/:id')
  // @ApiOperation({
  //   summary: 'returns profile - (unauthorized user has access to only 8 post)',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Success',
  //   type: [PostGetPost],
  //   content: {
  //     'application/json': {
  //       example: {
  //         statusCode: 201,
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'Not Found',
  // })
  // // @UseGuards()
  // @HttpCode(HttpStatus.OK)
  // async getMyPosts(@Query() base-input-query-params: BaseQueryParams, @Param('id') id: number) {
  //   const profile = await this.commandBus.execute(
  //     new GetMyProfileCommand(id, base-input-query-params),
  //   );
  //   if (!profile) throw new NotFoundException();
  //   return profile;
  // }
}
*/
