import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function OauthProviderCallbackDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Handles OAuth callback and issues tokens' }),
    ApiResponse({
      status: 200,
      description: 'Issues JWT accessToken and refreshToken in cookie',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized if authentication fails',
    }),
    ApiResponse({
      status: 429,
      description: 'Too many requests from the same IP in a short time',
    }),
  );
}
