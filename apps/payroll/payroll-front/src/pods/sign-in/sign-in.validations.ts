import { Validators } from '@lemoncode/fonk';
import { createFormikValidation } from '@lemoncode/fonk-formik';
import { passValidator, checkEmailExistsValidator } from './validations';

const validationSchema = {
  field: {
    name: [Validators.required],
    email: [Validators.required, Validators.email, checkEmailExistsValidator],
    password: [Validators.required, passValidator],
  },
};
export const formValidation = createFormikValidation(validationSchema);
