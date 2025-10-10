import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

export function LogoutDocs() {
  return applyDecorators(
    ApiSecurity('refreshToken'),
    ApiOperation({
      summary:
        'In cookie client must send correct refreshToken that will be revoked',
    }),
    ApiResponse({ status: 204, description: 'Logout successfully' }),
  );
}
