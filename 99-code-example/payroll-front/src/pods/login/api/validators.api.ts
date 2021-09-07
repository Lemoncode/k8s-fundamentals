import axios from 'axios';
import { FieldValidationFunctionAsync } from '@lemoncode/fonk';

export const existEmail: FieldValidationFunctionAsync = async ({ value }) => {
  const validationResult = {
    type: 'EMAIL_EXISTS',
    succeeded: false,
    message: 'The email exists',
  };
  return value === 'email@error.com'
    ? validationResult
    : { ...validationResult, succeeded: true, message: '' };
};
