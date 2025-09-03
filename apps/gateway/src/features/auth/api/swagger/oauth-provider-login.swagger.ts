import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function OauthProviderLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Redirects user to OAuth authentication' }),
    ApiResponse({
      status: 200,
      description: 'Redirects user to the OAuth login page',
    }),
    ApiResponse({
      status: 429,
      description: 'Too many requests from the same IP in a short time',
    }),
  );
}
