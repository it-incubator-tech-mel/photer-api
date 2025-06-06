import { UserQueryRepository } from '../infrastructure/user.query-repository';
import { Controller, Get } from '@nestjs/common';
import { GetUsersCount } from './swagger/get-user-count.swagger';
import { InternalServerErrorException } from '../../../core/exception-filters/exceptions/exception-types';

@Controller('users')
export class UserController {
  constructor(private readonly userQueryRepository: UserQueryRepository) {}

  @Get('count')
  @GetUsersCount()
  async getUsersCount(): Promise<number> {
    try {
      return await this.userQueryRepository.getCount();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
