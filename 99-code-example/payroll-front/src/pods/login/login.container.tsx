import React from 'react';
import { useHistory } from 'react-router-dom';
import { switchRoutes } from 'core/router';
import { validateLoginUser, registerNewUser } from './api/form.api';
import { Login } from './login.vm';
import { LoginComponent } from './login.component';
import { RegisterLoginComponent } from './register-login.component';

export const LoginContainer: React.FunctionComponent = () => {
  const [showError, setShowError] = React.useState<boolean>(false);
  const [isRegister, setIsRegister] = React.useState<boolean>(false);
  const [showRegister, setShowRegister] = React.useState<boolean>(false);

  const history = useHistory();

  const onLogin = async (login: Login) => {
    (await validateLoginUser(login.email, login.password))
      ? history.push(switchRoutes.employeeList)
      : setShowError(true);
  };

  const onRegister = async (login: Login) => {
    const result = await registerNewUser(login.email, login.password);
    if (result) {
      setIsRegister(true);
      setShowError(false);
    } else {
      setIsRegister(false);
      setShowError(true);
    }
  };

  return showRegister ? (
    <RegisterLoginComponent
      isRegister={isRegister}
      handleSubmit={onRegister}
      showError={showError}
    />
  ) : (
    <LoginComponent
      showError={showError}
      handleSubmit={onLogin}
      setShowRegister={setShowRegister}
    />
  );
};
