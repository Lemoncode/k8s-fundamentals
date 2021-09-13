import React from 'react';
import { Formik, Form } from 'formik';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Login, createEmptyLogin } from '../login.vm';
import * as classes from './login-form.styles';

interface Props {
  handleSubmit: (login: Login) => void;
}

export const LoginFormComponent: React.FunctionComponent<Props> = (props) => {
  const { handleSubmit } = props;

  return (
    <Formik onSubmit={handleSubmit} initialValues={createEmptyLogin()}>
      {({ isSubmitting, setFieldValue }) => (
        <Form className={classes.form}>
          <div className={classes.fields}>
            <TextField
              label="Email"
              type="email"
              name="email"
              onChange={(event) => setFieldValue('email', event.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              onChange={(event) =>
                setFieldValue('password', event.target.value)
              }
              required
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isSubmitting}
          >
            Login
          </Button>
        </Form>
      )}
    </Formik>
  );
};
