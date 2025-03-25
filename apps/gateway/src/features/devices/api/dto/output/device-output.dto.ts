import { ApiProperty } from '@nestjs/swagger';

export class DeviceOutputDto {
  @ApiProperty({
    description: 'IP address of device during signing in',
  })
  ip: string;

  @ApiProperty({
    description:
      'Device name: for example Chrome 105 (received by parsing http header "user-agent")',
  })
  title: string;

  @ApiProperty({
    description: 'Date of the last generating of refresh/access tokens',
  })
  lastActiveDate: string;

  @ApiProperty({
    description: 'Id of connected device session',
  })
  deviceId: string;
}
