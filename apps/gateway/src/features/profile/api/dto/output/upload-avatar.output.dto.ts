import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarOutputDto {
  @ApiProperty({
    description: 'Profile avatar url',
    type: String,
    example: 'https://storage.example.com/1/avatar1.jpg',
  })
  fileUrl: string;
}
