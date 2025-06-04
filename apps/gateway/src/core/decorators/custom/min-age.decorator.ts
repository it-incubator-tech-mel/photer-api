import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'minAge', async: false })
export class MinAgeConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const [minAge] = args.constraints;
    if (!value) return true;

    if (!/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.\d{4}$/.test(value)) {
      return false;
    }

    const [day, month, year] = value.split('.');
    const birthDate = new Date(`${year}-${month}-${day}`);

    if (isNaN(birthDate.getTime())) {
      return false;
    }

    const today = new Date();
    const age = this.calculateAge(birthDate, today);

    return age >= minAge;
  }

  private calculateAge(birthDate: Date, today: Date): number {
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  defaultMessage(args: ValidationArguments) {
    const [minAge] = args.constraints;
    return `A user under ${minAge} cannot create a profile`;
  }
}

export function MinAge(minAge: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minAge],
      validator: MinAgeConstraint,
    });
  };
}
