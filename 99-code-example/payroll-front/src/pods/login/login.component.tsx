import React from 'react';
import { useHistory } from 'react-router-dom';
import { Formik, Form } from 'formik';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { switchRoutes } from 'core/router';
import { Login, createEmptyLogin } from './login.vm';
import * as classes from './login.styles';

interface Props {
  showError: boolean;
  handleSubmit: (login: Login) => void;
}

export const LoginComponent: React.FunctionComponent<Props> = ({
  showError,
  handleSubmit,
}) => {
  const history = useHistory();
  const handleClick = () => history.push(switchRoutes.register);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <Formik onSubmit={handleSubmit} initialValues={createEmptyLogin()}>
          {({ isSubmitting, setFieldValue }) => (
            <Form className={classes.form}>
              <div className={classes.fields}>
                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  onChange={(event) =>
                    setFieldValue('email', event.target.value)
                  }
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
        {showError && (
          <div className={classes.error}>Email or password incorrect</div>
        )}
        <div>
          New user?{' '}
          <Button variant="text" onClick={handleClick}>
            Register.
          </Button>
        </div>
      </div>
    </div>
  );
};
