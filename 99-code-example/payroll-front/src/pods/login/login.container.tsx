import React from 'react';
import { useHistory } from 'react-router-dom';
import { switchRoutes } from 'core/router';
import { Login } from './login.vm';
import { LoginComponent } from './login.component';

interface Props {
  validateLoginUser: (email: string, password: string) => boolean;
}

export const LoginContainer: React.FunctionComponent<Props> = ({
  validateLoginUser,
}) => {
  const [showError, setShowError] = React.useState<boolean>(false);

  const history = useHistory();

  const onLogin = (login: Login) => {
   const result =  validateLoginUser(login.email, login.password);

   if(resul) {
     
   }
      ? history.push(switchRoutes.employeeList)
      : setShowError(true);
  };

  return <LoginComponent showError={showError} handleSubmit={onLogin} />;
};
