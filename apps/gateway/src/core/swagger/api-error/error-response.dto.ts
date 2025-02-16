import { ApiProperty } from '@nestjs/swagger';
import { FieldError } from './error-message.dto';

export class APIErrorResult {
  @ApiProperty({
    type: [FieldError],
    nullable: true,
    required: false,
  })
  errorsMessages: FieldError[];
}