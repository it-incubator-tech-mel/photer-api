import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

export function RefreshTokenDocs() {
  return applyDecorators(
    ApiSecurity('refreshToken'),
    ApiOperation({ summary: 'Generate new pair of access and refresh token' }),
    ApiResponse({
      status: 200,
      description:
        'Returns JWT accessToken (expired after 60 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired 5 minutes).',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
