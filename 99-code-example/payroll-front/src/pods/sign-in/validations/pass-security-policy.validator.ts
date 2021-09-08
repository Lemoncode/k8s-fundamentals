import { FieldValidationFunctionAsync } from '@lemoncode/fonk';

interface CustomArgs {
  field: string;
}

const VALIDATOR_TYPE = 'COMPLIANCE_SECURITY_POLICY';
export const passwordLenght = 8;

let defaultMessage = `Should be ${passwordLenght} characters or more, contain at least one lower case, contain at least one upper case and at least one number`;
export const setComplianceSecurityPolicyErrorMessage = (message) =>
  (defaultMessage = message);

export const passValidator: FieldValidationFunctionAsync<CustomArgs> = async ({
  value,
  message = defaultMessage,
}) => {
  const regexExpression = new RegExp(
    /^(?=.*\d)(?=.*[-’/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
  );

  const isValidate = regexExpression.test(value);

  return {
    succeeded: isValidate,
    message: isValidate ? '' : (message as string),
    type: VALIDATOR_TYPE,
  };
};
