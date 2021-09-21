import React from 'react';
import { trackPromise } from 'react-promise-tracker';
import { validateLoginUser, getAuthorise, Login } from './api';
import { mapAuthContextFromApiToVm } from './auth.mappers';
import { AuthContext } from './auth.context';
import { AuthUserContextVm, createEmptyAuthUserContext } from './auth.model';

export const AuthProvider: React.FunctionComponent = (props) => {
  const { children } = props;
  const [authUser, setAuthUser] = React.useState<AuthUserContextVm>(
    createEmptyAuthUserContext()
  );

  const handleLogin = async (login: Login) => {
    const isValidate = await validateLoginUser(login);
    if (isValidate) {
      trackPromise(
        getAuthorise(login.email)
          .then(mapAuthContextFromApiToVm)
          .then(setAuthUser)
          .catch(console.error)
      );
    }
  };

  const handleLogOut = async () =>
    Promise.resolve(setAuthUser(createEmptyAuthUserContext));

  React.useEffect(() => {
    setAuthUser({ ...authUser, login: handleLogin, logout: handleLogOut });
  }, []);

  return (
    <AuthContext.Provider value={authUser}>{children}</AuthContext.Provider>
  );
};
