import axios from 'axios';
import { FieldValidationFunctionAsync } from '@lemoncode/fonk';
import { checkEmailExists } from '../api';

const EMAIL_EXISTS = 'EMAIL_EXISTS';

export const checkEmailExistsValidator: FieldValidationFunctionAsync = async ({
  value,
}) => {
  const isValid = await checkEmailExists(value);
  const validationResult = {
    type: EMAIL_EXISTS,
    succeeded: isValid,
    message: isValid ? '' : 'The email exists',
  };

  return validationResult;
};
