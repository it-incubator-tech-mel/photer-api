import { IsString } from 'class-validator';

export class DeleteAvatarInputDto {
  @IsString()
  fileUrl: string;
}
