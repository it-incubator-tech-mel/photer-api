import { ApiProperty } from '@nestjs/swagger';
import { BasePaginatedOutputDto } from '../../../../../../../common/dto/base-output-dto/base-paginated.output.dto';
import { PaymentOutputDto } from './payment.output.dto';

export class PaginatedPaymentOutputDto extends BasePaginatedOutputDto<
  PaymentOutputDto[]
> {
  @ApiProperty({ type: [PaymentOutputDto] })
  items: PaymentOutputDto[];
}
