import React from 'react';
import { Formik, Form } from 'formik';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import { switchRoutes } from 'core/router';
import { useAuthContext } from 'core/providers/auth';
import { createEmptyLogin, Login } from '../login.vm';
import * as classes from './login-form.styles';

export const LoginFormComponent: React.FunctionComponent = () => {
  const [showError, setShowError] = React.useState<boolean>(false);
  const authUser = useAuthContext();
  const history = useHistory();

  const handleLogin = (login: Login) => {
    authUser.login(login);
    authUser.isLoggedIn ? setShowError(false) : setShowError(true);
  };

  React.useEffect(() => {
    if (authUser.isLoggedIn) {
      history.push(switchRoutes.employeeList);
    }
  }, [authUser]);

  return (
    <Formik onSubmit={handleLogin} initialValues={createEmptyLogin()}>
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
            // disabled={isSubmitting}
          >
            Login
          </Button>
          {showError && (
            <div className={classes.error}>Email or password incorrect</div>
          )}
        </Form>
      )}
    </Formik>
  );
};
