import { ValidationOptions } from 'class-validator';
import { registerDecorator } from 'class-validator';

export function IsNotBlank(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsNotBlank',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return true;
          return value.trim().length > 0;
        },
        defaultMessage(): string {
          return '${propertyName} must not be blank';
        },
      },
    });
  };
}