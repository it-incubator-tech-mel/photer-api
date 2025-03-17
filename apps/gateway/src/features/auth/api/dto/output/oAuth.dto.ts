import { ApiProperty } from '@nestjs/swagger';

export class OAuthDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  constructor(userId: string, email: string) {
    this.userId = userId;
    this.email = email;
  }
}
