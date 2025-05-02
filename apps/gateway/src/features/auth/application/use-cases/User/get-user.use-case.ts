import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../infrastructure/users.repository';
import { User } from '../../../domain/user.entity';

export class GetUserCommand {
  constructor(public readonly id: number) {}
}

@CommandHandler(GetUserCommand)
export class GetUserUseCase implements ICommandHandler<GetUserCommand> {
  constructor(private userRepository: UserRepository) {}
  async execute(command: GetUserCommand) {
    const user = await this.userRepository.findById(command.id);
    return User.ViewModel(user);
  }
}
