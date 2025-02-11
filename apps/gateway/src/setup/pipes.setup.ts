import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export function pipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const customErrors: { field: string; message: string }[] = []; // { field: e.property, message: e.msg }

        errors.forEach((e: ValidationError) => {
          if (e.constraints) {
            const constraintsKeys: string[] = Object.keys(e.constraints);

            constraintsKeys.forEach((cKey: string, index: number) => {
              if (index >= 1) return;

              const msg = e.constraints?.[cKey] as any;

              customErrors.push({
                field: e.property,
                message: msg,
              });
            });
          }
        });

        throw new BadRequestException(customErrors);
      },
    }),
  );
}
