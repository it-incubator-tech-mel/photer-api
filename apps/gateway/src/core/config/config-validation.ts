import { validateSync } from 'class-validator';

export const configValidation = {
  validateConfig: (config: any) => {
    const errors = validateSync(config);
    if (errors.length > 0) {
      const sortedMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      throw new Error('Validation failed: ' + sortedMessages);
    }
  },
  getEnumValues: (environments: Object) => {
    return Object.values(environments);
  }
}