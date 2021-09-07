import { Validators } from '@lemoncode/fonk';
import { createFormikValidation } from '@lemoncode/fonk-formik';
import { passValidator } from './validations/pass-security-policy';

const validationSchema = {
  field: {
    email: [Validators.required, Validators.email],
    password: [Validators.required, passValidator],
  },
};
export const formValidation = createFormikValidation(validationSchema);
