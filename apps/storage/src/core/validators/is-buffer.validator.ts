import { ValidateBy, buildMessage } from 'class-validator';

export const IS_BUFFER = 'isBuffer';

export function IsBuffer(validationOptions?: any) {
  return ValidateBy(
    {
      name: IS_BUFFER,
      validator: {
        validate: (value: any) => Buffer.isBuffer(value),
        defaultMessage: buildMessage(
          (eachPrefix) => `${eachPrefix} must be a Buffer`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
