// import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
// import { CommandBus } from '@nestjs/cqrs';
// import { GetUserCommand } from '../../posts/aplication/use-case/User/get-user.use-case';
// import { NotFoundException } from '../../../core/exception-filters/exceptions/exception-types';
//
// @Controller('users')
// export class UserController {
//   constructor(private commandBus: CommandBus) {}
//   @Get(':id')
//   @HttpCode(HttpStatus.OK)
//   async getUser(@Param('id') id: number) {
//     const profile = await this.commandBus.execute(new GetUserCommand(id));
//     if (!profile) throw new NotFoundException();
//     return profile;
//   }
// }
