import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Photer API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        description: 'Enter JWT Bearer token only',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .addApiKey(
      {
        type: 'apiKey',
        description: 'JWT refreshToken inside cookie. Must be correct, and must not expire',
        name: 'refreshToken',
        in: 'cookie',
      },
      'refreshToken',
    )
    .setVersion('1.0')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
    customSiteTitle: 'Photer Swagger',
  });
}
