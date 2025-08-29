import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaymentOutputDto } from '../dto/output/payment.output.dto';
import { PaginatedPaymentOutputDto } from '../dto/output/paginated-payment.output.dto';

export function GetMyPaymentsDocs() {
  return applyDecorators(
    ApiSecurity('bearer'),
    ApiExtraModels(PaymentOutputDto, PaginatedPaymentOutputDto),
    ApiOperation({
      summary: 'Get payments',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      schema: { $ref: getSchemaPath(PaginatedPaymentOutputDto) },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized – Bearer token required or invalid',
    }),
  );
}
