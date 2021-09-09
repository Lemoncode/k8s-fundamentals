import { createContext, useContext } from 'react';
import { AuthUserContextModel, createEmptyAuthUserContext } from './auth.model';

export const AuthContext = createContext<AuthUserContextModel>(
  createEmptyAuthUserContext()
);

export const useAuthContext = () =>
  useContext<AuthUserContextModel>(AuthContext);
