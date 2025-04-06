import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreatePostCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor() {}
  async execute() {}
}
