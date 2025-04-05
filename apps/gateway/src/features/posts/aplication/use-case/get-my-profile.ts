import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetMyProfileCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(GetMyProfileCommand)
export class GetMyProfileUseCase
  implements ICommandHandler<GetMyProfileCommand>
{
  constructor() {}
  async execute() {}
}
