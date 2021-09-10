import React from 'react';
import { useHistory } from 'react-router-dom';
import { switchRoutes } from 'core/router';
import { Login } from './login.vm';
import { LoginComponent } from './login.component';

interface Props {
  onLogin: (login: Login) => void;
}

export const LoginContainer: React.FunctionComponent<Props> = ({ onLogin }) => {
  const [showError, setShowError] = React.useState<boolean>(false);

  const history = useHistory();

  // const onLogin = (login: Login) => {
  //   const result = validateLoginUser(login.email, login.password);

  //   result ? history.push(switchRoutes.employeeList) : setShowError(true);
  // };

  return <LoginComponent showError={showError} handleSubmit={onLogin} />;
};
