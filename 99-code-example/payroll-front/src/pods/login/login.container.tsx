import React from 'react';
import { useHistory } from 'react-router-dom';
import { switchRoutes } from 'core/router';
import { validateLoginUser } from './api/form.api';
import { Login } from './login.vm';
import { LoginComponent } from './login.component';

export const LoginContainer: React.FunctionComponent = () => {
  const [showError, setShowError] = React.useState<boolean>(false);

  const history = useHistory();

  const onLogin = async (login: Login) => {
    (await validateLoginUser(login.email, login.password))
      ? history.push(switchRoutes.employeeList)
      : setShowError(true);
  };

  return <LoginComponent showError={showError} handleSubmit={onLogin} />;
};
