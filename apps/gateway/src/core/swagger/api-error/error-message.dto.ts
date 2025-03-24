import { ApiProperty } from '@nestjs/swagger';

export class FieldError {
  @ApiProperty({
    description: 'Message with error explanation for certain field',
    nullable: true,
    required: false,
  })
  message: string;

  @ApiProperty({
    description: 'What field/property of input model has error',
    nullable: true,
    required: false,
  })
  field: string;
}
