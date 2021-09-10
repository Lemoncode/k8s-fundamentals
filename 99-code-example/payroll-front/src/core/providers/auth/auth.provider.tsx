import React from 'react';
import { useHistory } from 'react-router-dom';
import { switchRoutes } from 'core/router';
import { validateLoginUser, getAuthorise, Login } from './api';
import { mapAuthContextFromApiToVm } from './auth.mappers';
import { AuthContext } from './auth.context';
import { AuthUserContextModel, createEmptyAuthUserContext } from './auth.model';

export const AuthProvider: React.FunctionComponent = (props) => {
  const { children } = props;
  const [AuthUser, setAuthUser] = React.useState<AuthUserContextModel>(
    createEmptyAuthUserContext()
  );
  const history = useHistory();

  const handleLogin = (login: Login) => {
    const isValidate = validateLoginUser(login);
    if (isValidate) {
      getAuthorise(login.email)
        .then(mapAuthContextFromApiToVm)
        .then(setAuthUser)
        .then(() => history.push(switchRoutes.employeeList))
        .catch(console.error);
    } else {
      history.push(switchRoutes.login);
    }
  };

  return (
    <AuthContext.Provider value={AuthUser}>{children}</AuthContext.Provider>
  );
};
