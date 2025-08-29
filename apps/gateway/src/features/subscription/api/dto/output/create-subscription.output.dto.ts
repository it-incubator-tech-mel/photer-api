import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionOutputDto {
  @ApiProperty({
    description: 'Base URL of the client app used for redirect after payment',
    example: 'https://your-app.com',
  })
  @IsUrl()
  readonly url: string;
}
