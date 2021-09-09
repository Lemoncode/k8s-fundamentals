import React from 'react';
import { AuthContext } from './auth.context';
import { AuthUserContextModel, createEmptyAuthUserContext } from './auth.model';

export const AuthProvider: React.FunctionComponent = (props) => {
  const { children } = props;
  const [AuthUser, setAuthUser] = React.useState<AuthUserContextModel>(
    createEmptyAuthUserContext()
  );

  return (
    <AuthContext.Provider value={AuthUser}>{children}</AuthContext.Provider>
  );
};
