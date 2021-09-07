import { Validators } from '@lemoncode/fonk';
import { createFormikValidation } from '@lemoncode/fonk-formik';
import { existEmail } from './api/validators.api';
import { passValidator } from './validations/pass-security-policy';

const validationSchema = {
  field: {
    email: [Validators.required, Validators.email, existEmail],
    password: [Validators.required, passValidator],
  },
};
export const formValidation = createFormikValidation(validationSchema);
