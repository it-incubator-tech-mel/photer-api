import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/trim';

export class NewPasswordDto {
  @IsString()
  @Trim()
  @IsNotEmpty({ message: 'newPassword is required' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscores, and hyphens',
  })
  newPassword: string;

  @Trim()
  @IsNotEmpty({ message: 'recoveryCode is required' })
  @IsUUID(4, { message: 'UUID not correct' })
  recoveryCode: string;
}
