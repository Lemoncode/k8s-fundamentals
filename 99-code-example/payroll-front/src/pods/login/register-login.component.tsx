import React from 'react';
import { useHistory } from 'react-router-dom';
import { Formik, Form, ErrorMessage } from 'formik';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { switchRoutes } from 'core/router';
import { formValidation } from './login.validations';
import { Login, createEmptyLogin } from './login.vm';
import * as classes from './login.styles';

interface Props {
  showError: boolean;
  isRegister: boolean;
  handleSubmit: (login: Login) => void;
}

export const RegisterLoginComponent: React.FunctionComponent<Props> = ({
  showError,
  isRegister,
  handleSubmit,
}) => {
  const history = useHistory();

  const handleClick = () => history.push(switchRoutes.login);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <Formik
          onSubmit={handleSubmit}
          initialValues={createEmptyLogin()}
          validate={formValidation.validateForm}
        >
          {({ isSubmitting, setFieldValue, errors }) => (
            <Form className={classes.form}>
              <div className={classes.fields}>
                <ErrorMessage
                  name="email"
                  component="div"
                  className={classes.error}
                />
                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  onChange={(event) =>
                    setFieldValue('email', event.target.value)
                  }
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className={classes.error}
                />
                <TextField
                  label="Password"
                  type="password"
                  name="password"
                  onChange={(event) =>
                    setFieldValue('password', event.target.value)
                  }
                />
              </div>
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                disabled={isSubmitting}
              >
                Register
              </Button>
            </Form>
          )}
        </Formik>
        {showError && (
          <div className={classes.error}>Email or password incorrect</div>
        )}
        {isRegister && (
          <div className={classes.success}>
            Register user success.{' '}
            <Button variant="text" onClick={handleClick}>
              Return to login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
